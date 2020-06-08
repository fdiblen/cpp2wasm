# Installation

## Dependencies

To run the commands in the README.md the following items are required

1. GNU C++ compiler (`g++`) and `make`, install with `sudo apt install -y build-essential`
1. [Apache httpd server 2.4](http://httpd.apache.org/), install with `sudo apt install -y apache2`
1. Python development, install with `sudo apt install -y python3-dev`
1. [Emscripten SDK](https://emscripten.org/docs/getting_started/downloads.html)
1. [Docker Engine](https://docs.docker.com/install/), setup so `docker` command can be run [without sudo](https://docs.docker.com/engine/install/linux-postinstall/#manage-docker-as-a-non-root-user).
1. [Perl](https://www.perl.org/), already installed on Linux

## Command collection

All the commands in the [README.md](README.md) and [CONTRIBUTING.md](CONTRIBUTING.md) can be captured in a [Makefile](https://en.wikipedia.org/wiki/Makefile) like so:

```{.makefile file=Makefile}
# this Makefile snippet is stored as Makefile
.PHONY: clean clean-compiled clean-entangled test all check entangle entangle-list py-deps start-redis stop-redis run-webservice run-celery-webapp run-webapp build-wasm host-files test-wasm

UID := $(shell id -u)
# Prevent suicide by excluding Makefile
ENTANGLED := $(shell perl -ne 'print $$1,"\n" if /^```\{.*file=(.*)\}/' *.md | grep -v Makefile | sort -u)
COMPILED := bin/calculatepi.exe src/py/calculatepipy.*.so apache2/cgi-bin/calculatepi src/js/calculatepiwasm.js  src/js/calculatepiwasm.wasm

entangle: *.md
	<<pandoc-tangle>>

$(ENTANGLED): entangle

entangled-list:
	@echo $(ENTANGLED)

py-deps: pip-pybind11 pip-flask pip-celery pip-connexion

pip-pybind11:
	<<pip-pybind11>>

pip-flask:
	<<pip-flask>>

pip-celery:
	<<pip-celery>>

pip-connexion:
	<<pip-connexion>>

bin/calculatepi.exe: src/cli-calculatepi.cpp
	<<build-cli>>

test-cli: bin/calculatepi.exe
	<<test-cli>>

apache2/cgi-bin/calculatepi: src/cgi-calculatepi.cpp
	<<build-cgi>>

test-cgi: apache2/cgi-bin/calculatepi
	<<test-cgi>>

src/py/calculatepipy.*.so: src/py-calculatepi.cpp
	<<build-py>>

test-py: src/py/example.py src/py/calculatepipy.*.so
	<<test-py>>

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
	<<start-redis>>

stop-redis:
	<<stop-redis>>

run-webapp: src/py/calculatepipy.*.so
	<<run-webapp>>

run-webservice: src/py/calculatepipy.*.so
	<<run-webservice>>

test-webservice:
	<<test-webservice>>

run-celery-worker: src/py/calculatepipy.*.so
	<<run-celery-worker>>

run-celery-webapp: src/py/calculatepipy.*.so
	<<run-celery-webapp>>

build-wasm: src/js/calculatepiwasm.js src/js/calculatepiwasm.wasm

src/js/calculatepiwasm.js src/js/calculatepiwasm.wasm: src/wasm-calculatepi.cpp
	<<build-wasm>>

host-files: build-wasm
	<<host-files>>

test-wasm:
	<<test-wasm>>

init-git-hook:
	<<hook-permission>>
	<<init-git-hook>>

check: entangle
	git diff-index --quiet HEAD --
```

For example the Python dependencies can be installed with

```shell
make py-deps
```

See [GitHub Actions workflow](.github/workflows/main.yml) and [CONTRIBUTING.md](CONTRIBUTING.md) for other usages of the Makefile.
