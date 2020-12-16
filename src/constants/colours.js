
// these are all pastel colours
// names do not align with the actual colours lol
const randomColour = () => {
    var colours = {
        blue1: "#00bbff",
        blue2: "#0000ff",
        green1: "#00ff00",
        greenyellow1: "#adff2f",
        yellow1: "#ffff4d",
        pink1: "#ff00ff",
        pink2: "#BB86FC",
        pink3: "#868cfc",
        pink4: "#ff2fad",
        red1: "red",
        orange1: "#ff812f",
        white1: "white",

    };

    var result;
    var count = 0;
    for (var prop in colours)
        if (Math.random() < 1 / ++count)
            result = colours[prop];
    return result;
}

export default randomColour;