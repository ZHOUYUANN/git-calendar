/**
 * gitCalender 是一个展示类似GitHub贡献的日历墙，可展示自定义时间段之间的提交数据频率
 * 使用只需 new Git() 传入参数即可
 * 可传参数为 
 * @param element 必须，挂在的dom元素节点
 * @param startDate 必须，表示日期开始的时间
 * @param data 必须，所需要展示的数据频率，当然你可以不传，但是这就没什么意义了
 * @param colorMap 非必须，需要展示的频率颜色深度，可以自己设置标识
 */
 (function (window) {
  var map = ['less', 'little', 'some', 'many', 'much'];
  var monthMap = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  // 常量，一排7个
  var COLUMN = 7;
  // 常量，年份的宽度
  var TITLE_WIDTH = 38;

  var Git = function (params) {
    this.extend(this.params, params)
    this.init()
  }
  Git.prototype = {
    params: {
      element: false,
      startDate: '',
      colorMap: [],
      data: []
    },
    init: function () {
      var element = this.params.element;
      var startDate = this.params.startDate;
      var colorMap = this.params.colorMap;
      var listWidth = [];
      if (!element || element.nodeType !== 1) return
      var currentDate = new Date();
      if (colorMap.length >= 5) {
        var chtml = '<div class="item '+ colorMap[0] +'"></div>' +
        '<div class="item '+ colorMap[1] +'"></div>' +
        '<div class="item '+ colorMap[2] +'"></div>' +
        '<div class="item '+ colorMap[3] +'"></div>' +
        '<div class="item '+ colorMap[4] +'"></div>' +
        '</div>'
      } else {
        var chtml = '<div class="item less"></div>' +
        '<div class="item little"></div>' +
        '<div class="item some"></div>' +
        '<div class="item many"></div>' +
        '<div class="item much"></div>' +
        '</div>'
      }
      var html = '<div class="git-box">' +
        '<div class="git-left">' +
        '<div class="day">周六</div>' +
        '<div class="day">周三</div>' +
        '<div class="day">周日</div>' +
        '</div>' +
        '<div class="git-right">' +
        '<div class="git-wrap">' +
        '<div class="git-content">' +
        '<div class="git-first"></div>' +
        '</div>' +
        '<div class="git-year">' + currentDate.getFullYear() + '</div>' +
        '</div>' +
        '</div></div>' +
        '<div class="git-color">' +
        '<div class="word">少</div>' +
        '<div class="list">' + chtml +
        '<div class="word">多</div>' +
        '</div>'
      element.innerHTML = html;
      // 1. 当前时间和开始时间的月份差
      var diffMonth = this.diffMonth(startDate);
      // 2. 通过获取的当前时间跟设置的开始时间差算出中间需要循环出的月份
      for (var i = 0; i < diffMonth; i++) {
        var mhtml = '<div class="month">' +
          '<div class="year"></div>' +
          '<div class="title"></div>' +
          '</div>';
        element.querySelector('.git-content').insertAdjacentHTML('afterbegin', mhtml);
        // 3. 获取开始日期的时间
        var date = new Date(startDate)
        // 4. 设置当前月份的Date，跟随月份递增
        date.setMonth(date.getMonth() + i);
        var year = date.getFullYear();
        var month = date.getMonth();
        var setCurrentDate = new Date(year, month, 1);
        // 获取当前月份的是从哪个日期开始的
        var firstDay = setCurrentDate.getDay();
        // 标记当年的时间
        if (month === 11 || (i === diffMonth - 1 && month !== 11)) {
          element.querySelectorAll('.month')[0].querySelector('.year').setAttribute('data-year', year);
          element.querySelectorAll('.month')[0].querySelector('.year').innerText = year;
        }
        // 设置每个月的月份
        element.querySelectorAll('.title')[0].innerHTML = monthMap[month]
        var months = [31, this.isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        var weeks = Math.ceil((firstDay + months[month]) / COLUMN);
        // 获取上个月有多少天
        var lastMonth = (month - 1 >= 0) ? (months[month - 1]) : 31;
        // 设置每个月有多少周，最后减一是为了去掉最后一周，因为在第一周的时候加上了上个月的时间
        // 这里有个注意的地方是，如果当月的最后一天如果是周日，就不需要再去减掉最后一周，可以直接显示出来
        date.setMonth(date.getMonth() + 1);
        var lastDay = new Date(date.setDate(0)).getDay();
        var len = 0;
        if (i !== diffMonth - 1 && lastDay !== 6) {
          weeks = weeks - 1;
          len = 0;
        } else {
          len = 7 - lastDay;
        }
        for (var j = 0; j < weeks; j++) {
          var whtml = '<div class="week">' +
            '<div class="day less"></div>' +
            '<div class="day less"></div>' +
            '<div class="day less"></div>' +
            '<div class="day less"></div>' +
            '<div class="day less"></div>' +
            '<div class="day less"></div>' +
            '<div class="day less"></div>' +
            '</div>'
          element.querySelectorAll('.month')[0].insertAdjacentHTML('beforeEnd', whtml)
        }
        var isFirstDay = false;
        var days = element.querySelectorAll('.month')[0].querySelectorAll('.day');
        // 保存临时变量使用
        var _firstDay = firstDay;
        var _month = month;
        var _year = year;
        // 每日的日期
        var day = 0;
        for (var m = days.length; m > len; m--) {
          day++
          var d = --_firstDay;
          // 因为是倒叙，所以就减 1 来获取索引
          var dayIndex = m - 1;
          // 获取上个月的最后一周的时间段 天数 
          var lastDays = dayIndex - firstDay;
          // 给当月的 1号 的前面加上 上个月的日期
          if (m > days.length - firstDay) {
            // 去掉第一个月的第一周里面的上一个月的末尾日期
            if (i === 0) {
              days[dayIndex].classList.add('none')
            }
            // 当时间到 12 月时需要重新设置一下年份和月份
            if (month === 0) {
              _month = 12
              _year = year - 1
            } else {
              _month = month
              _year = year
            }
            var num = this.parseDate(days[dayIndex], _year, _month, lastMonth - d)
            days[dayIndex].setAttribute('data-time', _year + '-' + _month + '-' + (lastMonth - d))
            days[dayIndex].setAttribute('data-tit', num + '次发文：' + _year + '-' + _month + '-' + (lastMonth - d))
            // days[dayIndex].innerText = lastMonth - d
          }
          if (!days[lastDays]) break;
          var num = this.parseDate(days[lastDays], year, month + 1, day)
          days[lastDays].setAttribute('data-time', year + '-' + (month + 1) + '-' + day)
          days[lastDays].setAttribute('data-tit', num + '次发文：' + year + '-' + (month + 1) + '-' + day)
          // days[lastDays].innerText = day
          // 拿到起始的日期索引，去掉最开始第一个月中的初始日期之前的日期
          if (!isFirstDay && i === 0) {
            if (
              (month + 1) == parseInt(startDate.substring(5, 7)) &&
              year == parseInt(startDate.substring(0, 4)) &&
              day == parseInt(startDate.substring(8, 10))
            ) {
              days[lastDays].classList.add('current')
              days[lastDays].setAttribute('data-time', year + '年' + (month + 1) + '月' + day + '日')
              days[lastDays].setAttribute('data-tit', '第一篇文章呀🐣')
              isFirstDay = true;
            } else {
              days[lastDays].classList.add('none')
            }
          }
          // 去掉最后一个月之中从当前日期往后的日期
          if (i === diffMonth - 1) {
            if (day > currentDate.getDate()) {
              days[lastDays].classList.add('none')
            }
          }
        }
      }
      var allMonths = document.querySelectorAll('.month');
      var yearList = []
      for (var q = 0; q < allMonths.length; q++) {
        var item = allMonths[q]
        if (item.querySelector('.year').getAttribute('data-year')) {
          listWidth.push(item.offsetLeft);
          yearList.push(item);
        }
      }
      // 偏移量，最好 0 - 10 之间
      var distance = 8;
      this.addEvent(document.querySelector('.git-wrap'), 'scroll', function (e) {
        var scrollX = e.target.scrollLeft;
        for (var i = 0; i < listWidth.length; i++) {
          var width1 = listWidth[i];
          var width2 = listWidth[i + 1];
          if (scrollX > width1 && scrollX < width2) {
            if (width2 - scrollX < TITLE_WIDTH + distance) {
              document.querySelector('.git-year').innerHTML = yearList[i + 1].querySelector('.year').getAttribute('data-year')
              yearList[i + 1].querySelector('.year').classList.add('active')
            } else {
              document.querySelector('.git-year').innerHTML = yearList[i].querySelector('.year').getAttribute('data-year')
              yearList[i + 1].querySelector('.year').classList.remove('active')
            }
          }
        }
      })
    },
    // 比较日期是否相等，如果相等就添加对应的 class 类
    parseDate: function (dom, year, month, day) {
      var gitData = this.params.data;
      var colorMap = this.params.colorMap;
      var num = 0;
      for (var n = 0; n < gitData.length; n++) {
        if (
          month == parseInt(gitData[n].time.substring(5, 7)) &&
          year == parseInt(gitData[n].time.substring(0, 4)) &&
          day == parseInt(gitData[n].time.substring(8, 10))
        ) {
          num = parseInt(dom.getAttribute('data-num')) || 0
          if (num) {
            num++
            dom.setAttribute('data-num', num)
          } else {
            num = 1
            dom.setAttribute('data-num', 1)
          }
          if (colorMap.length >= 5) {
            dom.style.background = colorMap[num]
          } else {
            dom.classList.remove('less')
            dom.classList.remove('little')
            dom.classList.remove('some')
            dom.classList.remove('many')
            dom.classList.remove('much')
            dom.classList.add(map[num])
          }
        }
      }
      return num;
    },
    isLeapYear: function (year) {
      // 判断 平年闰年[四年一闰，百年不闰，四百年再闰]
      return (year % 4 === 0) && (year % 100 !== 0 || year % 400 === 0);
    },
    diffMonth: function (startDate) {
      var date = new Date();
      var year = date.getFullYear();
      var month = date.getMonth();
      var startDateMonth = parseInt(startDate.split('-')[0]) * 12 + parseInt(startDate.split('-')[1]);
      var currentDateMonth = year * 12 + (month + 1)
      // 最后加上本身的一个月
      return currentDateMonth - startDateMonth + 1;
    },
    addEvent: function (elm, type, fn) {
      if (window.attachEvent) {
        elm.attachEvent("on" + type, fn);
      } else if (window.addEventListener) {
        elm.addEventListener(type, fn, false);
      } else {
        elm["on" + type] = fn;
      }
    },
    extend: function (a, b) {
      for (var key in b) {
        if (b.hasOwnProperty(key)) {
          a[key] = b[key]
        }
      }
      return a
    }
  }

  window.Git = Git
})(window)
