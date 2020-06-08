# this Makefile snippet is stored as Makefile
.PHONY: clean clean-compiled clean-entangled test all check entangle entangle-list py-deps start-redis stop-redis run-webservice run-celery-webapp run-webapp build-wasm host-files test-wasm

UID := $(shell id -u)
# Prevent suicide by excluding Makefile
ENTANGLED := $(shell perl -ne 'print $$1,"\n" if /^```\{.*file=(.*)\}/' *.md | grep -v Makefile | sort -u)
COMPILED := bin/calculatepi.exe src/py/calculatepipy.*.so apache2/cgi-bin/calculatepi src/js/calculatepiwasm.js  src/js/calculatepiwasm.wasm

entangle: *.md
	docker run --rm --user ${UID} -v ${PWD}:/data nlesc/pandoc-tangle:0.5.0 --preserve-tabs *.md

$(ENTANGLED): entangle

entangled-list:
	@echo $(ENTANGLED)

py-deps: pip-pybind11 pip-flask pip-celery pip-connexion

pip-pybind11:
	pip install pybind11

pip-flask:
	pip install flask

pip-celery:
	pip install celery[redis]

pip-connexion:
	pip install connexion[swagger-ui]

bin/calculatepi.exe: src/cli-calculatepi.cpp
	g++ src/cli-calculatepi.cpp -o bin/calculatepi.exe

test-cli: bin/calculatepi.exe
	./bin/calculatepi.exe

apache2/cgi-bin/calculatepi: src/cgi-calculatepi.cpp
	g++ -Ideps src/cgi-calculatepi.cpp -o apache2/cgi-bin/calculatepi

test-cgi: apache2/cgi-bin/calculatepi
	echo '{"niter": 500000000}' | apache2/cgi-bin/calculatepi

src/py/calculatepipy.*.so: src/py-calculatepi.cpp
	g++ -O3 -Wall -shared -std=c++14 -fPIC `python3 -m pybind11 --includes` \
	src/py-calculatepi.cpp -o src/py/calculatepipy`python3-config --extension-suffix`

test-py: src/py/example.py src/py/calculatepipy.*.so
	python src/py/example.py

test: test-cli test-cgi test-py test-webservice

all: $(ENTANGLED) $(COMPILED)

clean: clean-compiled clean-entangled

# Removes the compiled files
clean-compiled:
	$(RM) $(COMPILED)

# Removed the entangled files
clean-entangled:
	$(RM) $(ENTANGLED)

start-redis:
	docker run --rm -d -p 6379:6379 --name some-redis redis

stop-redis:
	docker stop some-redis

run-webapp: src/py/calculatepipy.*.so
	python src/py/webapp.py

run-webservice: src/py/calculatepipy.*.so
	python src/py/webservice.py

test-webservice:
	curl -X POST "http://localhost:8080/api/newtonraphson" -H "accept: application/json" -H "Content-Type: application/json" -d "{\"niter\":500000000}"

run-celery-worker: src/py/calculatepipy.*.so
	PYTHONPATH=src/py celery worker -A tasks

run-celery-webapp: src/py/calculatepipy.*.so
	python src/py/webapp-celery.py

build-wasm: src/js/calculatepiwasm.js src/js/calculatepiwasm.wasm

src/js/calculatepiwasm.js src/js/calculatepiwasm.wasm: src/wasm-calculatepi.cpp
	emcc --bind -o src/js/calculatepiwasm.js -s MODULARIZE=1 -s EXPORT_NAME=createModule src/wasm-calculatepi.cpp

host-files: build-wasm
	python3 -m http.server 8000

test-wasm:
	npx cypress run --config-file false

init-git-hook:
	chmod +x .githooks/pre-commit
	git config --local core.hooksPath .githooks

check: entangle
	git diff-index --quiet HEAD --