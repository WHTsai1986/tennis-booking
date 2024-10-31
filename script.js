document.addEventListener('DOMContentLoaded', () => {
    const calendarEl = document.getElementById('calendar');
    const scheduleEl = document.getElementById('schedule');
    const bookingForm = document.getElementById('bookingForm');
    const timeSlotSelect = document.getElementById('timeSlot');
    const yearSelect = document.getElementById('yearSelect');
    const monthSelect = document.getElementById('monthSelect');
    let selectedDay = null;

    // 初始化年份選擇（當前年份前後十年）
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 2; year <= currentYear + 2; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
    yearSelect.value = currentYear; // 設置為當前年份
    monthSelect.value = new Date().getMonth(); // 設置為當前月份

    // 預設每日的時間段，包含開放預約狀態
    const hours = Array.from({ length: 16 }, (_, i) => ({
        time: `${6 + i}:00 - ${7 + i}:00`,
        status: '開放預約'
    }));

    // 預約狀況紀錄，每天都有自己的時段預約狀態
    const availability = {};

    // 初始化時間段下拉選單
    function initTimeSlotOptions() {
        timeSlotSelect.innerHTML = '';
        hours.forEach(({ time }) => {
            const option = document.createElement('option');
            option.value = time;
            option.textContent = time;
            timeSlotSelect.appendChild(option);
        });
    }

    // 建立日曆顯示，並根據月份對齊每月的第一天
    function createCalendar(year = currentYear, month = new Date().getMonth()) {
        calendarEl.innerHTML = ''; // 清空日曆
        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 取得當月第一天是星期幾
        const daysInMonth = new Date(year, month + 1, 0).getDate(); // 取得當月的總天數

        // 調整第一天的星期位置（使日曆從星期一開始）
        const offset = (firstDayOfMonth + 6) % 7; // 計算偏移量，讓日曆從星期一開始

        // 添加空白格，讓每月第一天對應到正確的星期
        for (let i = 0; i < offset; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.classList.add('day', 'empty');
            calendarEl.appendChild(emptyDiv);
        }

        // 生成當月的每一天
        for (let day = 1; day <= daysInMonth; day++) {
            const date = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('day', 'available');
            dayDiv.textContent = day;
            calendarEl.appendChild(dayDiv);

            dayDiv.addEventListener('click', () => showSchedule(day));
        }
    }

    // 監聽年份和月份選擇的變更
    yearSelect.addEventListener('change', () => {
        createCalendar(parseInt(yearSelect.value), parseInt(monthSelect.value));
    });
    monthSelect.addEventListener('change', () => {
        createCalendar(parseInt(yearSelect.value), parseInt(monthSelect.value));
    });

    // 顯示所選日期的預約狀況
    function showSchedule(day) {
        selectedDay = day;
        scheduleEl.innerHTML = `<h3>${yearSelect.value}年${parseInt(monthSelect.value) + 1}月${day}日 預約狀況</h3>`;
        
        const list = document.createElement('ul');
        list.classList.add('time-slot-list');
        
        // 如果當天沒有預約記錄，使用初始狀態
        if (!availability[day]) {
            availability[day] = JSON.parse(JSON.stringify(hours));
        }

        // 顯示時間段的預約狀況
        availability[day].forEach(slot => {
            const listItem = document.createElement('li');
            listItem.textContent = `${slot.time} - ${slot.status}`;
            listItem.classList.add('time-slot-item', slot.status === '已預約' ? 'booked' : 'available');
            listItem.addEventListener('click', () => selectTimeSlot(slot.time));
            list.appendChild(listItem);
        });

        scheduleEl.appendChild(list);
        initTimeSlotOptions();
    }

    // 選擇時間段並在表單中設置
    function selectTimeSlot(time) {
        timeSlotSelect.value = time;
    }

    // 處理預約表單提交
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const timeSlot = timeSlotSelect.value;

        if (!selectedDay) {
            alert('請先選擇日期');
            return;
        }

        const dayAvailability = availability[selectedDay];
        const slot = dayAvailability.find(slot => slot.time === timeSlot);

        if (slot && slot.status === '開放預約') {
            // 更新狀態為已預約並顯示成功訊息
            slot.status = `已預約 by ${name}`;
            alert(`${name} 您已成功預約 ${timeSlot}`);
            showSchedule(selectedDay); // 更新顯示當日預約狀況
        } else {
            alert('該時段已被預約，請選擇其他時段');
        }

        bookingForm.reset(); // 重置表單
    });

    createCalendar(); // 初始化當前月份的日曆
});
