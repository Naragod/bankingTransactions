# Context

This project is meant to similuate a banking system, a use case that can be easily understood
and whose operations, READ, WRITE, UPDATE, DELETE in the context of a customer's balance we are familiar with.

This project will simulate, through the use of the event sourcing pattern, a banking system's customer transactions.

# Technologies Used
* NodeJs Typescript
* MongoDb
* MongoDB on the cloud (Atlas)


## Model Considerations

### Data Schema
We are replicating bank transactions. For that we require a few things

#### Transaction Schema
* Sender information (A name will suffice for now)
* Receiver information (^^)
* Transaction amount
* Date of transaction

Generally this is all that is required of our transaction object. In the future, currency information would be useful.
For this scenerario we are assuming all transactions will happen with the same currency.

We are also assuming that `Sender` & `Receiver` values are unique. Ideally we would want a hash for these values.
Currently a simple string is good enough for this demostration.

#### Snapshot Schema
* balance - current balance of customer at time of snapshot
* date - date of snapshot taken (represented as a unix time stamp)
* name - customer name - we are assuming that customer names are unique


## API Endpoints
As we are serving our bank customers, they would benefit from seeing:

* `/balance` - GET - Latest bank account balance - Date can also be specified to look at specific balance at a certain date.
* `/transfer` - POST - make transactions between accounts
* `/saveSnapshot` - POST - save account balance balance in a snapshot collection

# Usage
This demostration code has a mongoDb cloud hosted database.

Run `npm i` to install all required packages.
Run `npm run dev` to start server.

Endpoints are now avaialble to be called. Examples can be found in [here](superAdvisor.postman_collection.json) file.
Import it into postman and get ready to make requests.

## Notes

I realize that I have the credentials `creds.json` exposed. This is terrible practice and ideally, for prodcution usage,
we would store this information securely.