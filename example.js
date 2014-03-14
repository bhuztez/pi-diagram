function onLoad() {
    var canvas = document.getElementById("graph");
    var ctx = canvas.getContext("2d");
    var inputTextarea = document.getElementById("input");
    var resultDiv = document.getElementById("result");
    var resetButton = document.getElementById("reset");
    var stepButton = document.getElementById("step");

    var diagram;
    var state;

    function updateResult(text) {
        var newDiv = document.createElement("div");
        newDiv.id = "result";
        newDiv.appendChild(document.createTextNode(text));
        resultDiv.parentNode.replaceChild(newDiv, resultDiv);
        resultDiv = newDiv;
    }

    function updateGraph() {
        diagram.draw();
        canvas.width = diagram.canvas.width;
        canvas.height = diagram.canvas.height;
        ctx.drawImage(diagram.canvas, 0, 0);
    }

    function reset() {
        var code = parse_code(inputTextarea.value);

        if (code[0] === false) {
            updateResult(code[1]);
            stepButton.disabled = "disabled";
            return;
        }

        updateResult("OK");

        stepButton.disabled = "";
        diagram = new Diagram("main()");
        state = new State(code[1]);
        updateGraph();
    }

    function step() {
        var results = state.step();

        if (results.length === 0) {
            stepButton.disabled = "disabled";
            return;
        }

        for each (let result in results) {
            if (result[0] === 'new') {
                diagram.add_text(result[1], "new " + result[2], result[3]);
            } else if (result[0] === 'send') {
                diagram.add_text(result[1], "send " + result[2] + " to " + result[3], result[4]);
            } else if (result[0] === 'recv') {
                diagram.add_text(result[1], "recv " + result[2] + " from " + result[3], result[4]);
            } else if (result[0] === 'invoke') {
                diagram.add_text(result[1], result[2] + "(" + result[3].join(",") + ")");
            } else if (result[0] === 'branch') {
                diagram.branch(result[1]);
            } else if (result[0] === 'message') {
                diagram.add_line(result[1], result[2], result[3]);
            } else if (result[0] === 'end') {
                diagram.add_text(result[1], "END");
            }
        }

        diagram.new_row();
        updateGraph();
    }

    resetButton.addEventListener("click", reset);
    stepButton.addEventListener("click", step);
    reset();
}

window.addEventListener('load', onLoad);