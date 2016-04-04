# Idealogue

See the Idealogue repo for details on this project as a whole. This repo represents the Golang
implementation, and exists in its own repo to facilitate Go development.

## Setup

#### Dependencies
Be sure that you have the following dependencies installed before running this project:

- [RethinkDB](https://www.rethinkdb.com/docs/install/)
- [Go](http://golang.org/doc/install.html)

#### Installation Steps

Grab this project using the 'go get' command:

    $ go get -u github.com/davelaursen/idealogue-go

Install the frontend dependencies:

    $ cd $GOPATH/src/github.com/davelaursen/idealogue-go/client
    $ npm install -g typescript typings
    $ npm install

Build the Go server and Angular client app:

    $ cd $GOPATH/src/github.com/davelaursen/idealogue-go
    $ make build
    $ make build-ui

Run the application (be sure your local RethinkDB server is running):

    $ ./idealogue

Go to http://localhost:1977 in a browser (may need to clear cached files).
