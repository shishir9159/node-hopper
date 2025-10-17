##### Variables ######
COLOR := "\e[1;36m%s\e[0m\n"
CGO_ENABLED ?= 0
DOCKER ?= docker buildx
GOMOD := '/dev/null'
GOOS := linux
GOTELEMETRY='local'
GOVERSION := 'go1.24.2'
MAKEFLAGS += -j$(shell grep -c 'processor' /proc/cpuinfo)
NATIVE_ARCH := amd64

.PHONY: example
	@printf $(COLOR) "Building docker image for example and pushing it to the registry..."
	#docker build . -t laplaciandemon/kapetanios:latest
	docker build . -t laplaciandemon/example:latest -f example.Dockerfile
	docker push laplaciandemon/example:latest