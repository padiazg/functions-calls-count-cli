# OpenFaaS - Functions call count

## Project Overview
This project is designed to provide insights into the number of times your functions are invoked over a specified time period. It originated from the need to generate detailed reports on function request volumes, segmented by individual functions and time intervals, to better monitor and analyze system performance.

## Background
While monitoring the performance of our functions, we identified a recurring request from stakeholders for detailed reports on request traffic. These reports needed to break down the number of requests handled by each function over defined time periods. Initially, we explored using Grafana for this purpose, but due to certain limitations (potentially stemming from my inexperience with the tool), we were unable to achieve the desired outcome.

Through further investigation, we discovered that Prometheus offered a robust solution. By leveraging its API, we were able to directly query the necessary metrics and retrieve precise data on function invocations.

## Technical Implementation
The project utilizes Prometheus' API to execute queries such as:

```shell
http://localhost:9090/api/v1/query_range?query=gateway_function_invocation_total&start=2018-07-30T00:00:00.000Z&&end=2018-07-31T00:00:00Z&step=1h
```
To streamline the process, we developed a lightweight command-line tool that performs these queries and formats the output for easy interpretation. This tool is particularly useful for generating on-demand reports without the need for complex setup or manual intervention.

## Key Features

- Query and analyze function invocation metrics over custom time ranges.

- Generate clear, formatted reports for stakeholders.

- Lightweight and easy-to-use command-line interface.

This project simplifies the process of extracting and presenting critical performance data, making it an invaluable tool for monitoring and reporting on function usage.

## Before you start quering
Install dependencies with ```npm i```

If you call the program with no params it will show you some help.
```shell
$ node index.js
Usage: openfaas-function-call-count [options]

Options:

  -V, --version         output the version number
  -s --start <start>    Starting day
  -e --end <end>        End day
  -t --step <step>      Step
  -f --format <format>  Output format [table|json] (default: table)
  -h, --help            output usage information
```

## Query
The `step` and `format` parameters are optional, but you must provide `start` and `end` values, both in `YYYY-MM-DD` format.

Example:
```shell
$ node index.js -s '2018-07-30' -e '2018-07-31'

function-calls-count/200 sum=2
.---------------------------------------------.
|   |     Day/Hour     | Accum. Calls | Calls |
|---|------------------|--------------|-------|
| 1 | 2018-07-30 13:07 | 25           |       |
| 2 | 2018-07-30 14:07 | 27           |     2 |
'---------------------------------------------'

function-calls-count/500 sum=0
.---------------------------------------------.
|   |     Day/Hour     | Accum. Calls | Calls |
|---|------------------|--------------|-------|
| 1 | 2018-07-30 12:07 | 3            |       |
| 2 | 2018-07-30 13:07 | 3            |     0 |
| 3 | 2018-07-30 14:07 | 3            |     0 |
'---------------------------------------------'
```

Same than above, but in JSON format
```shell
$ node index.js -s '2018-07-30' -e '2018-07-31' -f json
[{"metric":{"__name__":"gateway_function_invocation_total","code":"200","function_name":"function-calls-count","instance":"10.0.0.6:8080","job":"gateway"},"values":[[1532970000,"25"],[1532973600,"27"]]},{"metric":{"__name__":"gateway_function_invocation_total","code":"500","function_name":"function-calls-count","instance":"10.0.0.6:8080","job":"gateway"},"values":[[1532966400,"3"],[1532970000,"3"],[1532973600,"3"]]}]
```

Output as ascii-table, grouped by 3 hour window
```shell
node index.js -s '2018-07-30' -e '2018-07-31' -t 3h

function1/200 sum=119
.---------------------------------------------.
|   |     Day/Hour     | Accum. Calls | Calls |
|---|------------------|--------------|-------|
| 1 | 2018-07-30 00:07 | 4534         |       |
| 2 | 2018-07-30 03:07 | 4534         |     0 |
| 3 | 2018-07-30 06:07 | 4534         |     0 |
| 4 | 2018-07-30 09:07 | 4580         |    46 |
| 5 | 2018-07-30 12:07 | 4653         |    73 |
'---------------------------------------------'

function2/200 sum=409
.---------------------------------------------.
|   |     Day/Hour     | Accum. Calls | Calls |
|---|------------------|--------------|-------|
| 1 | 2018-07-30 00:07 | 2000         |       |
| 2 | 2018-07-30 03:07 | 2000         |     0 |
| 3 | 2018-07-30 06:07 | 2001         |     1 |
| 4 | 2018-07-30 09:07 | 2140         |   139 |
| 5 | 2018-07-30 12:07 | 2409         |   269 |
'---------------------------------------------'

function1/500 sum=0
.---------------------------------------------.
|   |     Day/Hour     | Accum. Calls | Calls |
|---|------------------|--------------|-------|
| 1 | 2018-07-30 00:07 | 1            |       |
| 2 | 2018-07-30 03:07 | 1            |     0 |
| 3 | 2018-07-30 06:07 | 1            |     0 |
| 4 | 2018-07-30 09:07 | 1            |     0 |
| 5 | 2018-07-30 12:07 | 1            |     0 |
'---------------------------------------------'
```
