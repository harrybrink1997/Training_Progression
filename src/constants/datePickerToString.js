const datePickerToString = (inputDay) => {
    var day = String(inputDay.getDate()).padStart(2, '0');
    var month = String(inputDay.getMonth() + 1).padStart(2, '0'); //January is 0!
    var year = inputDay.getFullYear();

    var date = day + '.' + month + '.' + year;

    return date
}

export default datePickerToString