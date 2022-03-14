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
};

const account2 = {
  owner: 'Umid Rustamov',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Golib Dilmurodov',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarvinoz Dilmurodova',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
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

btnLogin.addEventListener('click', (event) => {
  event.preventDefault();
  let usr = inputLoginUsername.value;
  let pin = +inputLoginPin.value;
  currentUser = accounts.find(item => item.username === usr && item?.pin === pin && (labelWelcome.textContent = `Welcome ${item?.owner}`));
  if (currentUser) {
    containerApp.style.opacity = 1;
    inputLoginUsername.value = '';
    inputLoginPin.value = '';
    createTransactions(currentUser);
    amoutMoney(currentUser);
    cashback(currentUser);
    setTimer();
  }
})

// HTML Transactions Blocks

const transactionBlock = (trsacn, state, key) => `
  <div class="movements__row">
    <div class="movements__type movements__type--${state}">
      ${key + 1} withdrawal
    </div>
    <div class="movements__date">24/01/2037</div>
    <div class="movements__value">${trsacn}€</div>
  </div>`

const createTransactions = function (user) {
  containerMovements.innerHTML = '';
  user.movements.forEach((item, key) => {
    let state = null;
    if (item < 0) state = 'withdrawal'; else state = 'deposit';
    containerMovements.insertAdjacentHTML('afterbegin', transactionBlock(item, state, key));
  })
}

// Total Amount

let sum = null;

const amoutMoney = function (user) {
  sum = user.movements.reduce((acc, item) => acc + item, 0);
  labelBalance.textContent = `${sum} €`;
}

// Interest (komissiya)
let sumIn = null;
let sumOut = null;

const cashback = function (user) {
  sumOut = user.movements.reduce((acc, item) => item < 0 ? item + acc : acc, 0);
  sumIn = user.movements.reduce((acc, item) => item > 0 ? item + acc : acc, 0);
  let koms = user.movements.filter(item => item < 0).map(item => item * user.interestRate / 100).reduce((acc, item) => acc + item, 0)
  labelSumInterest.textContent = `${(koms).toFixed(2)}€`;
  labelSumIn.textContent = `${sumIn}`;
  labelSumOut.textContent = `${Math.abs(sumOut)}€`;
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
  if (loanAmount < (sumIn * 10) / 100) {

    user.movements.push(loanAmount);

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

  let minut = 1;
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
