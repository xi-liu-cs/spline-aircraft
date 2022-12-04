rooms.spline = function() {

lib2D();

description = 'spline';

code = {
init: `
    S.keys = 
    [
        {x: 100, y: 100, z: 100},
        {x: 200, y: 100, z: 0},
        {x: 100, y: 200, z: 0},
        {x: 200, y: 200, z: 0},
    ];
`,
assets: `
    S.line = (ax,ay,bx,by) => {
        S.context.beginPath();
        S.context.moveTo(ax,ay);
        S.context.lineTo(bx,by);
        S.context.stroke();
    }
    
    S.rect = (x,y,w,h) => {
        S.context.beginPath();
        S.context.rect(x,y,w,h);
        S.context.strokeStyle = 'white';
        S.context.stroke();
        if (S.isSpace) {
        S.context.fillStyle = 'gray';
        S.context.fill();
        }
    }

    S.spline = n =>
    {
        let bezier_matrix =
        [
            -1, 3, -3, 1,
            3, -6, 3, 0,
            -3, 3, 0, 0,
            1, 0, 0, 0,
        ],

        hermite_matrix =
        [
            2, -3, 0, 1,
            -2, 3, 0, 0,
            1, -2, 1, 0,
            1, -1, 0, 0,
        ],

        catmull_rom_matrix =
        [
            -1 / 2, 1, - 1 / 2, 0,
            3 / 2, - 5 / 2, 0, 1,
            -3 / 2, 2, 1 / 2, 0,
            1 / 2, - 1 / 2, 0, 0,
        ],

        c = S.context,
        mix = (a, b, t) => a + t * (b - a),

        /* px = matrixTransform(bezier_matrix, [ax, bx, cx, dx]),
        py = matrixTransform(bezier_matrix, [ay, by, cy, dy]); 

        px = matrixTransform(bezier_matrix, [ax, dx, bx - ax, dx - cx]),
        py = matrixTransform(bezier_matrix, [ay, dy, by - ay, dy - cy]);
        
        px = matrixTransform(catmull_rom_matrix, [ax, bx, cx, dx]),
        py = matrixTransform(catmull_rom_matrix, [ay, by, cy, dy]); */ 

        clamp = n => Math.max(0, Math.min(S.keys.length - 1, n)),

        px = matrixTransform(catmull_rom_matrix, [S.keys[clamp(n)].x, S.keys[clamp(n + 1)].x, S.keys[clamp(n + 2)].x, S.keys[clamp(n + 3)].x]),
        py = matrixTransform(catmull_rom_matrix, [S.keys[clamp(n)].y, S.keys[clamp(n + 1)].y, S.keys[clamp(n + 2)].y, S.keys[clamp(n + 3)].y]),
        pz = matrixTransform(catmull_rom_matrix, [S.keys[clamp(n)].z, S.keys[clamp(n + 1)].z, S.keys[clamp(n + 2)].z, S.keys[clamp(n + 3)].z]),
        
        xr = (x, z) => 
        {
            let canvas_size = 755;
            x -= canvas_size / 2;
            x = Math.cos(time) * x + Math.sin(time) * z; /* x rotate */
            x += canvas_size / 2;
            return x;
        };

        c.moveTo(xr(S.keys[clamp(n + 1)].x, S.keys[clamp(n + 1)].z), S.keys[clamp(n + 1)].y);

        let loop = 50;
        for(let i = 0; i <= loop; ++i)
        {
            let t = i / loop,
            x = t * (t * (t * px[0] + px[1]) + px[2]) + px[3], /* t ^ 3 * px[0] + t ^ 2 * px[1] + t * px[2] + px[3] */
            y = t * (t * (t * py[0] + py[1]) + py[2]) + py[3],
            z = t * (t * (t * pz[0] + pz[1]) + pz[2]) + pz[3];
            c.lineTo(xr(x, z), y);
        }
    }
`,
render: `
    let c = S.context;
    c.lineWidth = 3;
    c.lineCap = 'round';

    for(let i = 0; i < S.keys.length; ++i)
        S.rect(S.keys[i].x - 3, S.keys[i].y - 3, 6, 6);
        
    /* c.moveTo(100,100);
    c.bezierCurveTo(S.x,S.y, 100,300, 200,300); */

    for(let i = 0; i < S.keys.length - 1; ++i) /* n key points, n - 1 spline segments */
        S.spline(i - 1);

    S.spline(-1);
    
    c.stroke();
    c.lineWidth = 1;
`,
events: `
    onPress = (x, y) =>
    {
        S.n = -1;
        S.drag = false;
        for(let i = 0; i < S.keys.length; ++i) /* if miss all key points, then at end of this loop, S.n = -1, user did not press anything */
            if(S.keys[i].x - 10 <= x && x <= S.keys[i].x + 10 &&
               S.keys[i].y - 10 <= y && y <= S.keys[i].y + 10)
                S.n = i;
    }

    onDrag = (x,y) =>
    {
        S.drag = true;
        if(S.n >= 0) /* user pressed */
        {
            S.keys[S.n].x = x;
            S.keys[S.n].y = y;
        }
    }

    onRelease = (x, y) =>
    {
        if(!S.drag)
            if(S.n >= 0)
                S.keys.splice(S.n, 1);
            else
                S.keys.push({x: x, y: y});
    }

    onKeyPress = key => S.isSpace = key == 32;
    onKeyRelease = key => S.isSpace = false;
`
};

}