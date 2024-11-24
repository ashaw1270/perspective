import Space from './space.js';
import { canvas, ctx, draw } from './render.js';

// Note: (0, 0) is top left of screen

/*

        * topBack
* topLeft       * topRight
        * center

* bottomLeft    * bottomRight
        * bottom

*/

function dirVector(p1, p2) {
    if (p1.x === p2.x) {
        if (p1.y === p2.y) {
            return { x: 0, y: 0 };
        }

        if (p2.y < p1.y) {
            return { x: 0, y: 1 };
        }

        return { x: 0, y: -1 };
    }

    const output = { x: p2.x - p1.x, y: p2.y - p1.y };
    const length = Math.sqrt(output.x ** 2 + output.y ** 2);
    return { x: output.x / length, y: output.y / length };
}

function intersection(start1, end1, start2, end2) {
    const dir1 = dirVector(start1, end1);
    const dir2 = dirVector(start2, end2);
    const r = (start2.y - start1.y - dir1.y / dir1.x * (start2.x - start1.x))
            / (dir1.y * dir2.x / dir1.x - dir2.y);
    const x = start2.x + r * dir2.x;
    const y = start2.y + r * dir2.y;
    return { x, y };
}

class Box {
    constructor(space, center, height, length, width) {
        this.space = space;
        this.center = center;
        this.height = height;
        this.length = length;
        this.width = width;

        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };

        canvas.addEventListener('mousedown', e => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            function distPointToLine(point, p1, p2) {
                const num = Math.abs((p2.y - p1.y) * point.x - (p2.x - p1.x) * point.y + p2.x * p1.y - p1.x * p2.y);
                const denom = Math.sqrt((p2.y - p1.y) ** 2 + (p2.x - p1.x) ** 2);
                return num / denom;
            }

            if (mouseY <= this.bottom.y + 5 && mouseY >= this.center.y - 5 
                && distPointToLine({ x: mouseX, y: mouseY }, this.center, this.bottom) <= 5) {
                this.isDragging = true;
                this.dragOffset.x = mouseX - this.center.x;
                this.dragOffset.y = mouseY - this.center.y;
            }
        });

        canvas.addEventListener('mousemove', e => {
            if (!this.isDragging) {
                return;
            }

            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const dx = mouseX - this.dragOffset.x;
            const dy = mouseY - this.dragOffset.y;

            this.center = { x: dx, y: dy };
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.render();
        });

        canvas.addEventListener('mouseup', e => {
            this.isDragging = false;
        });
    }

    generateTopLeft() {
        const dir = dirVector(this.center, this.space.p1);
        const x = this.center.x + this.width * dir.x;
        const y = this.center.y + this.width * dir.y;
        this.topLeft = { x, y };
    }

    generateTopRight() {
        const dir = dirVector(this.center, this.space.p2);
        const x = this.center.x + this.length * dir.x;
        const y = this.center.y + this.length * dir.y;
        this.topRight = { x, y };
    }

    generateBottom() {
        const dir = dirVector(this.center, this.space.p3);
        const x = this.center.x + this.height * dir.x;
        const y = this.center.y + this.height * dir.y;
        this.bottom = { x, y };
    }

    generateTopBack() {
        this.topBack = intersection(this.topLeft, this.space.p2, this.topRight, this.space.p1);
    }

    generateBottomLeft() {
        this.bottomLeft = intersection(this.topLeft, this.space.p3, this.bottom, this.space.p1);
    }

    generateBottomRight() {
        this.bottomRight = intersection(this.topRight, this.space.p3, this.bottom, this.space.p2);
    }

    render() {
        this.generateTopLeft();
        this.generateTopRight();
        this.generateBottom();
        this.generateTopBack();
        this.generateBottomLeft();
        this.generateBottomRight();

        draw(this.center, this.topLeft);
        draw(this.center, this.topRight);
        draw(this.topLeft, this.topBack);
        draw(this.topRight, this.topBack);
        draw(this.center, this.bottom);
        draw(this.topLeft, this.bottomLeft);
        draw(this.topRight, this.bottomRight);
        draw(this.bottom, this.bottomLeft);
        draw(this.bottom, this.bottomRight);
    }
}

const p1 = { x: -500, y: -500 };
const p2 = { x: 2000, y: -500 };
const p3 = { x: 700, y: 1000 };
const space = new Space(p1, p2, p3);
const box = new Box(space, { x: 750, y: 300 }, 200, 200, 300);
box.render();
