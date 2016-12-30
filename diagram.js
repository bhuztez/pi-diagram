function max_row(columns, lines) {
    var row = 0;

    for (let column of columns) {
        var r = (column.slice(-1)[0] || [0])[0];
        if (r > row) {
            row = r;
        }
    }

    for (let line of lines) {
        var r = line[4];
        if (r > row) {
            row = r;
        }
    }

    return row;
}


function max_width(column) {
    var width = 0;

    for (let row of column) {
        if (row[1] !== "text") {
            continue;
        }

        var w = row[3];
        if (w > width) {
            width = w;
        }
    }

    return width;
}


function sum(array) {
    var s = 0;

    for (let elem of array) {
        s += elem;
    }

    return s;
}

var ROWHEIGHT = 24;
var ROWSEP = 32;
var MARGIN = 32;

var COLPAD = 8;
var COLSEP = 60;

var FONTHEIGHT = 16;


function column_x(column_widths, col) {
    return sum(column_widths.slice(0, col)) + COLPAD * 2 * col + COLSEP * col + MARGIN;
}


function row_y(row_num) {
    return ROWHEIGHT * (row_num - 1) + ROWSEP * (row_num - 1) + MARGIN;
}


function Diagram(initial) {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.ctx.font = "16px sans-serif";
    this.columns = [ [[1, "text", initial, this.ctx.measureText(initial).width, undefined]] ];
    this.lines = [];
    this.current_row = 2;
}

Diagram.prototype.new_row = function() {
    this.current_row += 1;
};


Diagram.prototype.add_text = function(col, text, annotate) {
    this.columns[col].push([this.current_row, "text", text, this.ctx.measureText(text).width, annotate]);
};


Diagram.prototype.add_line = function(from_col, to_col, annotate) {
    this.lines.push(
        [
            from_col,
            this.columns[from_col].slice(-1)[0][0],
            to_col,
            this.columns[to_col].slice(-1)[0][0],
            this.current_row,
            annotate
        ]);
};


Diagram.prototype.branch = function(col) {
    var target = this.columns.push([[this.current_row, "anchor"]]) - 1;
    this.columns[col].push([this.current_row, "branch", target]);
    return target;
};


Diagram.prototype.draw = function() {
    var columns = this.columns;
    var lines = this.lines;
    var ctx = this.ctx;

    var column_count = columns.length;
    var row_count = max_row(columns, lines);
    var column_widths = [for (c of columns) max_width(c)];

    var full_width = sum(column_widths) + COLPAD * 2 * column_count + COLSEP * (column_count - 1) + MARGIN * 2;
    var full_height = ROWHEIGHT * row_count + ROWSEP * (row_count - 1) + MARGIN * 2;

    this.canvas.width = full_width;
    this.canvas.height = full_height;

    ctx.font = "16px sans-serif";
    ctx.fillStyle = "rgb(0,0,0)";


    for (let i=0; i<column_count; i++) {
        var col_width = column_widths[i];
        var x = column_x(column_widths, i);

        var last_y = null;


        for (let row of columns[i]) {
            var row_num = row[0];
            var y = row_y(row_num);

            if (row[1] === "text") {
                var dx = COLPAD + (col_width - row[3]) / 2;
                ctx.fillText(row[2], x + dx, y + FONTHEIGHT);
                ctx.strokeRect(x, y, col_width+2*COLPAD, ROWHEIGHT);

                if (row[4] !== undefined) {
                    ctx.fillText(row[4], x + COLPAD*2 + col_width, y);
                }

                if (last_y !== null) {
                    ctx.beginPath();
                    ctx.moveTo(x+COLPAD+col_width/2, last_y);
                    ctx.lineTo(x+COLPAD+col_width/2, y);
                    ctx.stroke();
                }

                last_y = y + ROWHEIGHT;
            } else if (row[1] === "branch") {
                var target_x = column_x(column_widths, row[2]);
                var target_width = column_widths[row[2]];
                var dx = COLPAD + col_width / 2;

                ctx.beginPath();
                ctx.arc(x+dx, y+ROWHEIGHT/2, 8, 0, Math.PI*2);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(x+COLPAD+col_width/2+8, y+ROWHEIGHT/2);
                ctx.lineTo(target_x+COLPAD+target_width/2, y+ROWHEIGHT/2);
                ctx.stroke();

                if (last_y !== null) {
                    ctx.beginPath();
                    ctx.moveTo(x+COLPAD+col_width/2, last_y);
                    ctx.lineTo(x+COLPAD+col_width/2, y + ROWHEIGHT/2 - 8);
                    ctx.stroke();
                }

                last_y = y + ROWHEIGHT/2 + 8;
            } else if (row[1] === "anchor") {
                last_y = y + ROWHEIGHT/2;
            }

        }
    }


    for (let [from_col, from_row, to_col, to_row, line_row, annotate] of lines) {
        var left_col, left_row, right_col, right_row;

        if (from_col < to_col) {
            left_col = from_col;
            left_row = from_row;
            right_col = to_col;
            right_row = to_row;
        } else if (from_col > to_col) {
            left_col = to_col;
            left_row = to_row;
            right_col = from_col;
            right_row = from_row;
        }

        var left_x = column_x(column_widths, left_col) + column_widths[left_col] + 2*COLPAD;
        var left_y = row_y(left_row) + ROWHEIGHT/2;
        var right_x = column_x(column_widths, right_col);
        var right_y = row_y(right_row) + ROWHEIGHT/2;
        var line_y = row_y(line_row) + ROWHEIGHT/2;

        ctx.beginPath();
        ctx.moveTo(left_x, left_y);
        ctx.lineTo(left_x + COLSEP/3, left_y);
        ctx.lineTo(left_x + COLSEP/3, line_y);
        ctx.lineTo(right_x - COLSEP/3, line_y);
        ctx.lineTo(right_x - COLSEP/3, right_y);
        ctx.lineTo(right_x, right_y);
        ctx.stroke();

        if (from_col < to_col) {
            ctx.beginPath();
            ctx.moveTo(right_x-8, right_y-4);
            ctx.lineTo(right_x, right_y);
            ctx.lineTo(right_x-8, right_y+4);
            ctx.fill();
        } else if (from_col > to_col) {
            ctx.beginPath();
            ctx.moveTo(left_x+8, left_y-4);
            ctx.lineTo(left_x, left_y);
            ctx.lineTo(left_x+8, left_y+4);
            ctx.fill();
        }

        if (annotate !== undefined) {
            ctx.fillText(annotate, left_x+COLSEP/3, line_y + FONTHEIGHT);
        }

    }
};
