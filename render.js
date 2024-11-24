export const canvas = document.getElementById('canvas');
export const ctx = canvas.getContext('2d');

ctx.strokeStyle = 'black';
ctx.lineWidth = 1;

export function draw(p1, p2) {
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
}

//ctx.clearRect(0, 0, canvas.width, canvas.height);
