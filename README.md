# Such EVENTS (so scare!).

A backend built using event-sourced microservices.

- Written in TypeScript.
- Uses [NATS Streaming Server](https://github.com/nats-io/nats-streaming-server) as it’s main event log. You could easily use Kafka or RabbitMQ instead.
- Uses [protobuf.js](https://github.com/dcodeIO/protobuf.js) to handle message validation and versioning.
