'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Tolib Dilmurodov',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
  locale: 'US',
  currency: 'EUR'
};

const account2 = {
  owner: 'Umid Rustamov',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
  locale: 'US',
  currency: 'USD'
};

const account3 = {
  owner: 'Golib Dilmurodov',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
  locale: 'US',
  currency: 'USD'
};

const account4 = {
  owner: 'Sarvinoz Dilmurodova',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
  locale: 'US',
  currency: 'EUR'
};

const accounts = [account1, account2, account3, account4];

accounts.forEach((item) => {
  item.username = item.owner.toLowerCase().split(' ').map(function (val) {
    return val[0];
  }).join('');
  console.log(item.username);

})

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

let currentUser = null;
let tempUser = null;

// Num Manage

const amountFormat = function (user = currentUser, amount) {
  optionsNum.currency = user.locale;
  return new Intl.NumberFormat(
    user.locale, {
      style: 'currency',
      currency: user.currency
  }).format(amount);
}

let date =  new Date();
let timeH = `${date.getHours()}`.padStart(2, "0")
let timeM = `${date.getMinutes()}`.padStart(2, "0")
let year = `${date.getFullYear()},  ${timeH}:${timeM}`.padStart(4, "0");
let month = `${date.getMonth()}`.padStart(2, "0");
let day = `${date.getDate()}`.padStart(2, "0");


// MovementsDate 

let movementsDate = [
  '2021-05-16T11:45:41.583Z',
  '2021-06-16T11:45:41.583Z',
  '2021-12-16T11:45:41.583Z',
  '2022-01-16T11:45:41.583Z',
  '2022-02-16T11:45:41.583Z',
  '2022-03-16T11:45:41.583Z',
  '2022-03-16T11:45:41.583Z',
  '2022-03-16T11:45:41.583Z'
]

// Movementsdate to string

const dateTransaction = function (key) {
  let [yearTrans, monthTrans, dateTrans] = movementsDate[key].split('T')[0].split('-');
  let hour = +movementsDate[key].split('T')[1].split(':')[0] + 5 + '';
  let minute = movementsDate[key].split('T')[1].split(':')[1]
  return [yearTrans, monthTrans, dateTrans, hour, minute];
}

btnLogin.addEventListener('click', (event) => {
  event.preventDefault();
  let usr = inputLoginUsername.value;
  let pin = +inputLoginPin.value;
  currentUser = accounts.find(item => item.username === usr && item?.pin === pin && (labelWelcome.textContent = `Welcome ${item?.owner}`));
  if (currentUser) {
    tempUser = currentUser;
    containerApp.style.opacity = 1;
    inputLoginUsername.value = '';
    inputLoginPin.value = '';
    labelDate.textContent = `${day}/${month}/${year}`;
    createTransactions(currentUser);
    amoutMoney(currentUser);
    cashback(currentUser);
    setTimer();
  } else {
    currentUser = tempUser;
    alert('Your username or password Wrong!');
  };
})

// HTML Transactions Blocks

const transactionBlock = (trsacn, state, key) => `
  <div class="movements__row">
    <div class="movements__type movements__type--${state}">
      ${key + 1} withdrawal
    </div>
    <div class="movements__date">${dateTransaction(key)[2]}/${dateTransaction(key)[1]}/${dateTransaction(key)[0]}, ${dateTransaction(key)[3]}: ${dateTransaction(key)[4]}</div>
    <div class="movements__value">${trsacn}€</div>
  </div>`

const createTransactions = function (user) {
  containerMovements.innerHTML = '';
  user.movements.forEach((item, key) => {
    let state = null;
    if (item < 0) state = 'withdrawal'; else state = 'deposit';
    containerMovements.insertAdjacentHTML('afterbegin', transactionBlock(amountFormat(user, item.toFixed(2)), state, key));
  })
}

// Total Amount

let sum = null;

const amoutMoney = function (user) {
  sum = user.movements.reduce((acc, item) => acc + item, 0);
  labelBalance.textContent = `${amountFormat((user, sum))}`;
}

// Interest (komissiya)

let sumIn = null;
let sumOut = null;

const cashback = function (user) {
  sumOut = user.movements.reduce((acc, item) => item < 0 ? item + acc : acc, 0);
  sumIn = user.movements.reduce((acc, item) => item > 0 ? item + acc : acc, 0);
  let koms = user.movements.filter(item => item < 0).map(item => item * user.interestRate / 100).reduce((acc, item) => acc + item, 0)
  labelSumInterest.textContent = `${(koms).toFixed(2)}€`;
  labelSumIn.textContent = `${Math.abs(amountFormat(user, sumIn.toFixed(2)))}`;
  labelSumOut.textContent = `${Math.abs(amountFormat(user, sumOut.toFixed(2)))}`;
}

// Transfer Money

btnTransfer.addEventListener('click', (event) => {
  event.preventDefault();
  console.log('click btn')
  transfer();
})


const transfer = function (user = currentUser) {
  let transferTo = inputTransferTo.value;
  let transferAmount = +inputTransferAmount.value;

  if (transferAmount < sum && sum > 0) {

    let userTo = accounts.find(item => item.username === transferTo);

    if (userTo !== user && userTo) {

      userTo?.movements.push(transferAmount);
      user.movements.push(-Math.abs(transferAmount));
      movementsDate.push(new Date().toISOString()+'');
      console.log(movementsDate)
      amoutMoney(user);
      cashback(user);
      createTransactions(user);
      inputTransferTo.value = '';
      inputTransferAmount.value = '';
    }
  }
}

// Request Loan

btnLoan.addEventListener('click', (event) => {
  event.preventDefault();

  setTimeout(() => requestLoan(currentUser), 1500);
})

const requestLoan = function (user = currentUser) {
  let loanAmount = +inputLoanAmount.value;
  if (loanAmount < (sumIn * 10) / 100 && loanAmount > 0) {

    user.movements.push(loanAmount);
    movementsDate.push(new Date().toISOString()+'');
    amoutMoney(user);
    cashback(user);
    createTransactions(user);
    inputLoanAmount.value = '';
  }
}

// Close Account 

btnClose.addEventListener('click', (event) => {
  event.preventDefault();
  closeAccount();
  //...
})

const closeAccount = function (user = currentUser) {
  let userAcc = inputCloseUsername.value;
  let passwordAcc = +inputClosePin.value;
  if (user.username == userAcc && user.pin === passwordAcc) {
    containerApp.style.opacity = 0;
    let userIndex = accounts.findIndex((acc) => acc.username === user.username)
    accounts.splice(userIndex, 1);
    console.log(accounts);
    inputClosePin.value = '';
    inputCloseUsername.value = '';
    labelWelcome.textContent = 'Log in to get started';
  }
}

// Sort

let sorted = false;
btnSort.addEventListener('click', (event) => {
  event.preventDefault();
  if (sorted) sorted = false; else sorted = true;
  console.log(sorted);
  sorting(currentUser);
});

let arr = null;
const sorting = function (user = currentUser) {
  let temp = [...user.movements];
  if (sorted) {
    temp.sort((a, b) => a - b);
    arr = [...user.movements];
    user.movements = [...temp];
  } else { user.movements = arr; temp = arr };
  createTransactions(user);
}

// Timer

/* Task: create Timer
* setTime - funksiya vaqtni HTML da uzgarishini boshqaradi.
* setTimer - harbir muvofaqqiyatli saytga kirishda ishleydi
*/

const setTime = function (minut, secund) {

  labelTimer.innerHTML = `${String((Math.trunc(secund / 60))).padStart(2, 0)} : ${String((Math.trunc(secund % 60))).padStart(2, 0)}`;
  secund--;

  return function () {
    labelTimer.innerHTML = `${String((Math.trunc(secund / 60))).padStart(2, 0)} : ${String((Math.trunc(secund % 60))).padStart(2, 0)}`;
    secund--;
  }

}

const setTimer = function () {
  btnLogin.addEventListener('click', () => {
    if (currentUser) {
      console.log(timeInterval);
      clearInterval(timeInterval);
      clearTimeout(timeOut);
    }
  });

  let minut = 10;
  let secund = minut * 60;

  console.log(minut, secund);

  let time = setTime(minut, secund);

  // vaqt quyamiz 1s oralatib

  let timeInterval = setInterval(
    time, 1000);
  // 1 daqiqa utganidan so'ng setTimout clearInterval funksiyani chaqiradi 
  // u interval vaqtni tuxtatadi va chiqib ketadi
  let timeOut = setTimeout(() => {
    clearInterval(timeInterval);
    console.log(timeInterval);
    containerApp.style.opacity = 0;
    labelWelcome.textContent = 'Log in to get started';
  }, secund * 1000);

}


/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////

// let currentTime = new Date();

// let options = {
//   day: "2-digit",
//   month: '2-digit',
//   weekday: 'long',
//   year: 'numeric',
//   hour: '2-digit',
//   minute: '2-digit',
//   second: '2-digit',
//   hour12: false,
// }

// let dateTime = Intl.DateTimeFormat('uz-UZ',  options).format(currentTime);
// console.log(dateTime);

// => 2022-03-16, Wed 19:03:54

// let nums = 12323;

// let options = {
//   style: "currency",
//   currency: 'USD'
// }

// let numsLocate = new Intl.NumberFormat('US', options).format(nums);

// console.log(numsLocate);

// // ANS: 12 323,00 $