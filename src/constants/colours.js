
// these are all pastel colours
// names do not align with the actual colours lol
const randomColour = () => {
    var colours = {
        mint: "#B5EAD7",
        periwinkle: "#C7CEEA",
        dirty_white: "#E2F0CB",
        pale_orange: "#FFDAC1",
        melon: "#FFB7B2",
        salmon_pink: "#FF9AA2",

        light_red: "#FFD3D4",
        blossom_pink: "#FFB9C4",
        lilac: "#CAA7BD",
        manatee: "#9A91AC",

        darkmagenta: "#8b008b",
        darkolivegreen: "#556b2f",
        darkorange: "#ff8c00",
        darkorchid: "#9932cc",
        darkred: "#8b0000",
        darksalmon: "#e9967a",
        darkviolet: "#9400d3",
        fuchsia: "#ff00ff",
        green: "#008000",
        indigo: "#4b0082",
        khaki: "#f0e68c",
        lightgrey: "#d3d3d3",
        lightpink: "#ffb6c1",
        lime: "#00ff00",
        magenta: "#ff00ff",
        maroon: "#800000",
        navy: "#000080",
        olive: "#808000",
        orange: "#ffa500",
        pink: "#ffc0cb",
        purple: "#800080",
        violet: "#800080",
        red: "#ff0000",
    };

    var result;
    var count = 0;
    for (var prop in colours)
        if (Math.random() < 1 / ++count)
            result = prop;
    return result;
}

export default randomColour;