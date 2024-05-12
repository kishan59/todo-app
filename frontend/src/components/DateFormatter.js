import React from 'react'

const DateFormatter = (type, date) => {
    date = new Date(date);
    if(type == 'yyyy-mm-dd'){
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }else if(type == 'day month') {
        const day = date.getDate();
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const monthIndex = date.getMonth();
        const suffix = getDaySuffix(day);
        return `${day}${suffix} ${monthNames[monthIndex]}`;
    }else{
        return date;
    }
}

function getDaySuffix(day) {
    if (day >= 11 && day <= 13) {
        return 'th';
    }
    switch (day % 10) {
        case 1:  return 'st';
        case 2:  return 'nd';
        case 3:  return 'rd';
        default: return 'th';
    }
}

export default DateFormatter