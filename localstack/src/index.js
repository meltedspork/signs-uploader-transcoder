const dayjs = require('dayjs');

exports.handler =  async function(event, context) {
    var now = dayjs();
    console.log('+*+++*+*+*+*+START*+*+*+*+*+**+*++*+*');
    console.log('EVENT OCCURRED!');
    console.log(`Message created on ${now}`);
    // Print the event that triggers the lambda
    console.log("EVENT: \n" + JSON.stringify(event, null, 2));
    console.log('+*+++*+*+*+*+*END+*+*+*+*+**+*++*+*');
    return context.logStreamName
}
