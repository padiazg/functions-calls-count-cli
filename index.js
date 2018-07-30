const program = require("commander");
const moment = require("moment-timezone");
const request = require("request-promise-native");
const AsciiTable = require('ascii-table');
const { prometheusUrl, defaultFormat } = require("./config.js");

program
    .version("0.1.0")
    .option("-s --start <start>", "Starting day")
    .option("-e --end <end>", "End day")
    .option("-t --step <step>", "Step")
    .option("-f --format <format>", "Output format [table|json]", /^(table|json)$/i, 'table')
    .parse(process.argv);

if (!program.start || !program.end) {
    program.outputHelp();
    process.exit(1);
}

// const format = program.format ? program.format.toUpperCase() : defaultFormat;

const base = '/api/v1/query_range';

const outputTable = data => {
    for (const {metric, values} of data.result) {
        const table = new AsciiTable('Functions');

        table.fromJSON({
            heading: ['','Day/Hour', 'Accum. Calls', 'Calls'],
            rows: values.map((v,i,x) => {
                return [
                    i+1,    // index
                    moment(v[0], 'X').format("YYYY-MM-DD HH:MM"),   // Day/Hour
                    v[1],                                           // Accummulated calls
                    i>0 ? parseInt(v[1])-parseInt(x[i-1][1]) : ''   // Calls in this step
                ] // return ...
            }) // rows: ...
        }); // fromJSON ...

        const sum = parseInt(values[values.length-1][1]) - parseInt(values[0][1]);
        console.log(`\n${metric.function_name}/${metric.code} sum=${sum}`)
        console.log(table.toString());
    } // for ...
} // outputTable ...

request({
    uri: `${prometheusUrl}${base}`,
    qs: {
        query: 'gateway_function_invocation_total',
        start: moment(program.start, "YYYY-MM-DD").format(),
        end: moment(program.end, "YYYY-MM-DD").format(),
        step: program.step || '1h'
    }
})
.then(result => {
    const { data } = JSON.parse(result);
    if (program.format.toLowerCase() == 'table') {
        outputTable(data);
    }

    if (program.format.toLowerCase() == 'json') {
        console.log(JSON.stringify(data.result));
    }
})
.catch(e => console.log(e))
;
