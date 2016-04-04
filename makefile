GO ?= go
OUTFILE ?= idealogue

clean:
	rm -f ./services/coverage.out
	rm -f ./routes/coverage.out
	rm -f ./coverage.out
	rm -f $(OUTFILE)

build: clean
	$(GO) build -v ./services/*.go
	$(GO) build -v ./routes/*.go
	$(GO) build -v -o $(OUTFILE) ./*.go

clean-ui:
	find ./client/src/app -name "*.js" -delete
	find ./client/src/app -name "*.js.map" -delete

build-ui: clean-ui
	cd client; tsc

watch-ui: clean-ui
	cd client; tsc -w

install: build
	$(GO) install ./...

run: build
	./$(OUTFILE)

test: install
	$(GO) test -cover -short ./...

test-verbose: install
	$(GO) test -cover -short -v ./...

cover: install
	$(GO) test -coverprofile=services/coverage.out -short ./services
	$(GO) test -coverprofile=routes/coverage.out -short ./routes
	$(GO) test -coverprofile=coverage.out -short .

cover-report: cover
	$(GO) tool cover -html=./services/coverage.out
	$(GO) tool cover -html=./routes/coverage.out
	$(GO) tool cover -html=./coverage.out
