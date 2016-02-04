# revelio-openapi
Adapter to publish [Open API](https://openapis.org) specification files to a [Revelio](https://www.getrevelio.com) site.

## Command line parameters

`revelio-openapi <path_to_configuration_file> <revelio_url> [configuration_name] [options]`

- `path_to_configuration_file` - File path to your configuration file
- `revelio_url` - URL of your Revelio installation
- `configuration_name` (optional) - Name of the configuration to use
- `options`
 - `--publicKey <publicKey>` - Public API key. Only necessary if your Revelio server requires API key authentication
 - `--secretKey <secretKey>` - Secret API key. Only necessary if your Revelio server requires API key authentication

## Configuration file

In order to publish documentation to Revelio, you need to create a Revelio configuration file.
This contains information about how to read documentation from your code and 
how it should be shown in Revelio.


### Basic file
 ```json
 {
     "url": "http://myapiurl.com",
     "target": "./myOpenApiSpec.yml",
     "path": "Sample Group/My API/QA/v1.2.3"
 }
 ```

### Multiple configurations
```json
 {
     "target": "./myOpenApiSpec.yml",
     "configurations": {
         "DEV": {
            "url": "http://dev.myapiurl.com",
            "path": "Sample Group/My API/DEV/v1.2.3"
         },
         "QA": {
            "url": "http://qa.myapiurl.com",
            "path": "Sample Group/My API/QA/v1.2.3"
         },
         "PROD": {
            "url": "http://myapiurl.com",
            "path": "Sample Group/My API/PROD/v1.2.3"
         }
 }
```

## Endpoint names

Revelio will attempt to use the optional `operationId` field for the endpoint name. If it you prefer to use a different 
name, you can specify it with the `x-name` extension. If neither field is provided, Revelio will 
generate a name based off the path and method. For example, `GET /person/{personId}` 
would have the name "Get Person". In most cases this is acceptable, but for endpoints like `GET /person/byName`
it breaks down.

## Additional attributes


### Examples
You can add examples to parameters and properties by using the `x-examples` extension.

```yaml
parameters:
  - in: query
    name: firstName
    type: string
    x-examples: 
      - Mark
      - Bob
      - Lucius
```

Revelio will use the `example` field for simple types
```yaml
name:
  type: string
  example: doggie
# Adds "doggie" as an example for "name"
```

It will also use the `example` field for complex types
```yaml
type: object
properties:
  id:
    type: integer
    format: int64
  name:
    type: string
example:
  name: Puma
  id: 1

# Adds "Puma" as an example for "name", and "1" as an example for "id"
```

All of these approaches will be combined into a single list of examples per property

### Metadata
Any extension items that aren't already used for other purposes (e.g. `x-examples` and `x-name`)
will be added as metadata for endpoints, parameters, and properties. See `examples/withMetadata.yml`
for reference.

## Open API Specification in Revelio
Please note that not all components of the specification are included in Revelio. We've aimed to include
the pieces that fit the existing Revelio product. Let us know if you would like additional support added. 