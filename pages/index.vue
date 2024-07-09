<script setup>
import CardIcon from "~/components/CardIcon.vue";
import { EmailValidator, CVCValidator, ExpiryDateValidator, CreditCardValidator } from "assets/js/validators.js";

const timer = ref()
const concludingMessage = ref("GOGoGOGO11!1!! Ur product manager and a senior engineer are already judging you.");
const showConcludingMessage = ref(false);
const hasAcceptedTerms = ref(false);
const hasPlayedGame = ref(false);
const gameMode = ref('full');
const shareShortCode = ref('');

const inputEmail = ref('');
const inputEmailInvalid = ref('');
const inputCardNumber = ref('');
const inputCardNumberInvalid = ref('');
const inputExpiry = ref('');
const inputExpiryInvalid = ref('');
const inputCvc = ref('');
const inputCvcInvalid = ref('');
const inputName = ref('');
const inputCountry = ref('');
const inputAddressOne = ref('');
const inputAddressTwo = ref('');
const inputCity = ref('');
const inputZipCode = ref('');

const cardType = ref('')
const cardDeclineCode = ref('')
const cardErrorCode = ref('')

const inputDeclaredValid = ref(false);

const inputValidators = {
  email: new EmailValidator(),
  expiry: new ExpiryDateValidator(),
  cvc: new CVCValidator(),
  card: new CreditCardValidator(),
};

const isGameModeFull = computed(() => gameMode.value === 'full');
const isGameModeCard = computed(() => gameMode.value === 'card');

/*
TODO:
 - Build overview of favorite indie hackers, products, and tools
 - Save data to DB (score / mode / time / unique shortcode)
 - Make OG image generation using shortcode
 - Make URL shortcut for sharing with shortcode
 - Build "share your score" button
 - Make a leaderboard (?)
 */

// make a special watch for the expiry date, if there are two digits typed, add a slash automatically.
// if the backspace is used, remove the slash and 2nd digit (both), as if the slash didn't exist.
const onInput = (event) => {
  let value = event.target.value;

  // Remove non-numeric characters except slash
  value = value.replace(/[^\d\/]/g, '');

  // Handle adding slash
  if (value.length === 2 && !value.includes('/')) {
    value += '/';
  }

  // Ensure maximum length of 5 characters (MM/YY)
  if (value.length > 5) {
    value = value.slice(0, 5);
  }

  inputExpiry.value = value;
};

const onKeydown = (event) => {
  if (event.key === 'Backspace') {
    const value = inputExpiry.value;
    if (value.length === 3 && value.charAt(2) === '/') {
      inputExpiry.value = value.slice(0, 2);
      event.preventDefault(); // Prevent default backspace behavior
    }
  }
};

onMounted(() => {
  const cardIcons = document.querySelectorAll('.card-icon');
  let currentIndex = 0;

  function showNextIcon() {
    cardIcons[currentIndex].classList.remove('opacity-100', 'scale-100');
    cardIcons[currentIndex].classList.add('opacity-0', 'scale-[0.9]');

    currentIndex = (currentIndex + 1) % cardIcons.length;

    cardIcons[currentIndex].classList.remove('opacity-0', 'scale-[0.9]');
    cardIcons[currentIndex].classList.add('opacity-100', 'scale-100');
  }

  setInterval(showNextIcon, 2000);

  //watch whether hasAcceptedTerms goes to true
  watch(hasAcceptedTerms, (value) => {
    if (value) {
      timer.value = new Timer();
    }
  });
});

const startGame = () => {
  if (hasAcceptedTerms.value) {
    timer.value.start();
  }
};

const stopGame = () => {
  hasPlayedGame.value = true;
  timer.value.stop();

  const outcome = validateResults();

  if(outcome) {

  }
};

const shareGame = async () => {
  shareShortCode.value = ''

  // Grab score in seconds and a placeholder name
  const score = timer.value.getTime();
  const name = 'Erwin';
  const mode = gameMode.value;
  const data = { score, name, mode };

  try {
    // Use $fetch to call the encrypt API
    const response = await $fetch('/api/encrypt', {
      method: 'POST',
      body: { code: JSON.stringify(data) },
    });

    // Store the encrypted shortcode
    shareShortCode.value = response.encryptedCode;
  } catch (error) {
    console.error('Error encrypting game data:', error);
    shareShortCode.value = null;
  }
};

const restartGame = () => {
  hasPlayedGame.value = false;
  showConcludingMessage.value = false;

  timer.value = new Timer();

  cardType.value = '';
  cardDeclineCode.value = '';
  cardErrorCode.value = '';

  inputCardNumber.value = '';
  inputCardNumberInvalid.value = '';
  inputExpiry.value = '';
  inputExpiryInvalid.value = '';
  inputCvc.value = '';
  inputCvcInvalid.value = '';

  // should only be filled with gamemode full but just reset anyway
  inputEmail.value = '';
  inputEmailInvalid.value = '';
  inputName.value = '';
  inputCountry.value = '';
  inputAddressOne.value = '';
  inputAddressTwo.value = '';
  inputCity.value = '';
  inputZipCode.value = '';
};

const disableInputs = computed(() => {
  return !hasAcceptedTerms.value || hasPlayedGame.value;
});

const limitCardNumberLength = () => {
  if (inputCardNumber.value.length > 16) {
    inputCardNumber.value = inputCardNumber.value.slice(0, 16);
  }
};

const validateResults = () => {

  // first, we need to validate all inputs if they aren't empty
  if(isGameModeFull.value && (inputEmail.value === '' || inputCardNumber.value === '' || inputExpiry.value === '' || inputCvc.value === ''
      || inputName.value === '' || inputCountry.value === '' || inputAddressOne.value === '' || inputCity.value === '' || inputZipCode.value === '')
      || isGameModeCard.value && (inputCardNumber.value === '' || inputExpiry.value === '' || inputCvc.value === '')) {
    concludingMessage.value = 'Oh rekt you didn\'t fill all inputs lmao';
    showConcludingMessage.value = true;
    inputDeclaredValid.value = false;
    return;
  }

  // then we check if Email, expiry, cvc are of the right formatting
  if (isGameModeFull.value && !inputValidators.email.isValid(inputEmail.value)) {
    inputEmailInvalid.value = 'check ur @ and .com, fam. this email is broken';
    concludingMessage.value = 'Ur formatting is wrong m8'
  }

  if (!inputValidators.expiry.isValid(inputExpiry.value)) {
    // split on the slash, grab the end part (the year) and convert it to a full year (based on 20 only)
    const expiryParts = inputExpiry.value.split('/');
    const year = expiryParts[1].length === 2 ? '20' + expiryParts[1] : expiryParts[1];

    if(year < new Date().getFullYear()) {
      inputExpiryInvalid.value = `Ehh.. ${year} called, they want your card back cause it's EXPIRED.`;
    } else {
      inputExpiryInvalid.value = `Yeah nah that's not a valid expiry date.. try again.`;
    }

    concludingMessage.value = 'Ur formatting is wrong m8'
  }

  if (!inputValidators.cvc.isValid(inputCvc.value)) {
    inputCvcInvalid.value = '(>.>) That is not a valid cvc. Get your head in the game.';
    concludingMessage.value = 'Ur formatting is wrong m8'
  } else {
    // if it's certain numbers
    /*
    007 - "Bond, James Bond."
    123 - "Easy as 1-2-3!"
    404 - "CVC Not Found. Try again."
    666 - "Devilish choice, aren't we?"
    777 - "Lucky number! Jackpot!"
    911 - "Call for help! CVC emergency!"
     */
  }

  const cardValidationOutcome = inputValidators.card.validate(inputCardNumber.value);
  if (!cardValidationOutcome.isValid) {
    cardDeclineCode.value = cardValidationOutcome.declineCode;
    cardErrorCode.value = cardValidationOutcome.errorCode;
    inputCardNumberInvalid.value = 'That\'s not a test card, it says error code' + cardErrorCode.value + (cardDeclineCode.value ? ' because ' + cardDeclineCode.value : '.');
    concludingMessage.value = 'Ur formatting is wrong m8'
  } else {
    // save the validationOutcome card type
    cardType.value = cardValidationOutcome.cardType;
  }

  // do a final check if anything is invalid. If not, show success messages depending on the time
  if((isGameModeFull.value && inputEmailInvalid.value) || inputCardNumberInvalid.value || inputExpiryInvalid.value || inputCvcInvalid.value) {
    showConcludingMessage.value = true;
    inputDeclaredValid.value = false;
    return false;
  } else {
    // Different messages every 2 seconds of timer.value.getTime. Lower is better
    if ((isGameModeFull.value && timer.value.getTime() < 3) || (isGameModeCard.value && timer.value.getTime() < 1)) {
      concludingMessage.value = 'Ehhh are you sure you didn\'t cheat??';
    } else if ((isGameModeFull.value && timer.value.getTime() < 6) || (isGameModeCard.value && timer.value.getTime() < 2)) {
      concludingMessage.value = 'Absolute f$#cking legend! I bet your code must compile before you even type haha!';
    } else if ((isGameModeFull.value && timer.value.getTime() < 8) || (isGameModeCard.value && timer.value.getTime() < 3)) {
      concludingMessage.value = 'You have a keyboard with keys that type a whole credit card at once or smth lawl??';
    } else if ((isGameModeFull.value && timer.value.getTime() < 10) || (isGameModeCard.value && timer.value.getTime() < 4)) {
      concludingMessage.value = 'Absolute fire but maybe try again cause there\'s more fun messages lol pls try harder and read those, took me so long to come up with them =\')';
    } else if ((isGameModeFull.value && timer.value.getTime() < 13) || (isGameModeCard.value && timer.value.getTime() < 5)) {
      concludingMessage.value = 'HMMMMMRRR! Ur blazin\' there wow but can you like, try harder?! I want you to see the other messages lol';
    } else if ((isGameModeFull.value && timer.value.getTime() < 16) || (isGameModeCard.value && timer.value.getTime() < 6)) {
      concludingMessage.value = 'Sick score but don\'t share this because your friends might unfollow you, you can do better!';
    } else if ((isGameModeFull.value && timer.value.getTime() < 19) || (isGameModeCard.value && timer.value.getTime() < 7)) {
      concludingMessage.value = 'Pretty fast. Did you grease up your keyboard before attempting this round?';
    } else if ((isGameModeFull.value && timer.value.getTime() < 22) || (isGameModeCard.value && timer.value.getTime() < 8)) {
      concludingMessage.value = 'Eh oke nice I guess haha but try harder okay?';
    } else if ((isGameModeFull.value && timer.value.getTime() < 25) || (isGameModeCard.value && timer.value.getTime() < 10)) {
      concludingMessage.value = 'This is average what were you doing? Can\'t afford typo\'s okay try again.';
    } else if ((isGameModeFull.value && timer.value.getTime() < 28) || (isGameModeCard.value && timer.value.getTime() < 11)) {
      concludingMessage.value = 'LOL did you forget to turn on your keyboard or smth?';
    } else if ((isGameModeFull.value && timer.value.getTime() < 31) || (isGameModeCard.value && timer.value.getTime() < 12)) {
      concludingMessage.value = 'Mate were you looking up validation rules on stack overflow first? C\'mon this is too slow!';
    } else if ((isGameModeFull.value && timer.value.getTime() < 34) || (isGameModeCard.value && timer.value.getTime() < 13)) {
      concludingMessage.value = 'Did you get scared? Cause your keyboard seems to be ghost typing LOL this is way too slow try again'
    } else if ((isGameModeFull.value && timer.value.getTime() < 37) || (isGameModeCard.value && timer.value.getTime() < 14)) {
      concludingMessage.value = 'I ran out of things to say here like srsly what are you doing???!';
    } else if ((isGameModeFull.value && timer.value.getTime() < 40) || (isGameModeCard.value && timer.value.getTime() < 15)) {
      concludingMessage.value = 'Ugh at this point I think maybe you\'re typing with your feet or smth wtf is this???';
    } else {
      concludingMessage.value = 'You\'re not even trying anymore are you? I\'m disappointed. Hand in your programmer badge NOW.';
    }

    showConcludingMessage.value = true;
    inputDeclaredValid.value = true;
    return true;
  }
}

class Timer {
  constructor() {
    this.startTime = 0;
    this.elapsedTime = 0;
    this.running = false;
    this.rafId = null;
  }

  start() {
    if (this.running) return; // Prevent multiple starts

    this.running = true;
    this.startTime = performance.now() - this.elapsedTime; // Adjust start time based on elapsed time
    this.rafId = requestAnimationFrame(this.update.bind(this)); // Start the animation frame loop
  }

  stop() {
    if (!this.running) return; // If not running, do nothing

    this.running = false;
    cancelAnimationFrame(this.rafId); // Stop the animation frame loop
    this.rafId = null;
  }

  update() {
    if (!this.running) return; // If not running, stop updating

    this.elapsedTime = performance.now() - this.startTime; // Calculate elapsed time
    this.rafId = requestAnimationFrame(this.update.bind(this)); // Continue the animation frame loop
  }

  getTime() {
    return this.elapsedTime / 1000; // Return the current time in seconds
  }

  hasBeenActivated() {
    return this.elapsedTime > 0;
  }

  hasStopped() {
    return this.hasBeenActivated && !this.running;
  }

  isRunning() {
    return this.running;
  }
}
</script>

<template>
  <div class="h-full min-h-screen h-100%">
    <div class="h-full flex flex-col lg:flex-row">

      <div class="lg:w-[40%] flex bg-indigo-600 font-mono text-white p-4">
        <div class="grow flex flex-col justify-between">
          <div class="grow w-full">
            <h1 class="text-2xl text-center mt-8 lg:mt-16">4242.pro</h1>
            <p class="text-center my-2 mx-4">👀 Let's see if ur a 10x engineer or a n00b, your goal is to fill this checkout form asap.</p>

            <!-- BEFORE GAME / ACCEPTING TERMS -->
            <template v-if="!hasAcceptedTerms">
              <p class="text-center mt-16 mb-2 mx-4 italic">First, please click the button below to confirm you understand this is a GAME and not REAL. If you enter your real CC details, perhaps I will charge you! Don't gamble, be warned. Okay now that you have read this, click the button below and show me ur sk1lz.</p>
              <button @click="hasAcceptedTerms = true" class="mt-4 flex mx-auto bg-white text-indigo-600 rounded-lg px-4 py-2">Yes, I understand the above m8 dw</button>
            </template>

            <!-- CURRENT STATE OR OUTCOME OF GAME -->
            <template v-else>
              <div class="mt-4 lg:mt-8 grid max-w-sm gap-x-2 grid-cols-3 mx-auto">
                <div class="text-white font-bold items-center flex">Game modes</div>
                <div class="border-white px-4 py-2 cursor-pointer" @click="gameMode = 'full'"
                     :class="isGameModeFull ? 'border-2 text-white bg-indigo-700' : 'text-gray-400 hover:border-2'">
                  Full form
                </div>
                <div class="border-white px-4 py-2 cursor-pointer" @click="gameMode = 'card'"
                     :class="isGameModeCard ? 'border-2 text-white bg-indigo-700' : 'text-gray-400 hover:border-2'">
                  Card only
                </div>
              </div>

              <template v-if="!timer.hasBeenActivated() || timer.isRunning() || (timer.hasStopped() && inputDeclaredValid)">
                <p class="mt-8 lg:mt-32 text-4xl text-center">{{ timer ? timer.getTime().toFixed(4) : '' }} seconds</p>
                <button v-if="!shareShortCode" @click="shareGame()" class="mt-4 flex mx-auto bg-white text-indigo-600 rounded-lg px-4 py-2">Share! (experiment)</button>
                <p v-if="shareShortCode" class="mt-2 text-sm italic text-center break-all">Here is your shareable link: <a :href="'https://4242.pro/s/' + shareShortCode" target="_blank" class="underline">https://4242.pro/s/{{ shareShortCode }}</a></p>
              </template>

              <p class="mt-2 text-sm italic text-center" v-if="!timer.hasBeenActivated()">Starts wen focussing on any input</p>

              <p class="my-8 text-3xl text-center" v-if="showConcludingMessage">{{ concludingMessage }}</p>

              <button @click="restartGame()" v-if="hasPlayedGame" class="mt-4 flex mx-auto bg-white text-indigo-600 rounded-lg px-4 py-2">Play again</button>
            </template>

          </div>

          <div class="mt-32 lg:mt-0 text-sm text-center">
            <p>Made by <a href="https://x.com/erwin_ai" target="_blank" class="cursor-pointer underline hover:text-gray-200">@Erwin_AI</a>. I got inspired after having to enter these details four hundred trillion times. May the 4 be with you 2!</p>
          </div>
        </div>
      </div>

      <div class="lg:w-[60%] bg-gray-100">

        <div class="my-16 mx-auto rounded-lg w-full max-w-xl">
          <div class="flex flex-col space-y-1.5 p-6">
            <h3 class="whitespace-nowrap text-2xl font-semibold leading-none tracking-tight">Pay with card</h3>
          </div>
          <div class="p-6 space-y-4">
            <div v-if="!isGameModeCard" class="space-y-2">
              <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" for="email">Email</label>
              <input @focusin="startGame()" :disabled="disableInputs" v-model="inputEmail" class="flex h-10 w-full max-w-lg rounded-md border px-3 py-2 bg-white text-sm text-[#1a1a1ae6] leading-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                     id="email" placeholder="imightspamyoul8ter@justkiddingiwont.com" type="email" autocorrect="off" spellcheck="false" data-1p-ignore="true">

              <p v-if="inputEmailInvalid" class="grow text-xs text-red-500 italic">{{ inputEmailInvalid }}</p>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Card information</label>
              <div class="relative w-full bg-white">
                <div class="relative">
                  <span class="block m-0 p-0 relative w-full">
                    <input :disabled="disableInputs" @input="limitCardNumberLength" @focusin="startGame()" v-model="inputCardNumber"
                         class="flex h-10 w-full max-w-lg rounded-md border px-3 py-2 text-sm text-[#1a1a1ae6] leading-normal relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                         autocorrect="off" spellcheck="false" id="cardNumber" name="cardNumber" type="text" inputmode="numeric" placeholder="1234 1234 1234 1234" aria-describedby="" data-1p-ignore="false">
                  </span>
                </div>
                <div class="flex items-center pointer-events-none absolute right-0 top-0 h-full pr-2 z-[3]" style="opacity: 1;">
                  <CardIcon src="/visa.svg" alt="Visa" />
                  <CardIcon src="/mastercard.svg" alt="MasterCard" />
                  <CardIcon src="/amex.svg" alt="American Express" />

                  <div class="relative flex items-center h-4 w-7">
                    <CardIcon src="/unionpay.svg" alt="UnionPay" :secondaryCard="true" />
                    <CardIcon src="/jcb.svg" alt="JCB" :secondaryCard="true" />
                    <CardIcon src="/discover.svg" alt="Discover" :secondaryCard="true" />
                    <CardIcon src="/diners.svg" alt="Diners Club" :secondaryCard="true" />
                  </div>
                </div>
              </div>
              <p v-if="inputCardNumberInvalid" class="grow text-xs text-red-500 italic">{{ inputCardNumberInvalid }}</p>
              <div class="grid grid-cols-2 items-center gap-x-[2px]">
                <input @focusin="startGame()" :disabled="disableInputs" v-model="inputExpiry" class="flex h-10 w-full rounded-md border px-3 py-2 bg-white text-sm text-[#1a1a1ae6] leading-normal focus-visible:z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-r-none"
                       id="expiry" placeholder="MM / JJ" @input="onInput" @keydown="onKeydown">
                <input @focusin="startGame()" :disabled="disableInputs" v-model="inputCvc" class="flex h-10 w-full rounded-md border px-3 py-2 bg-white text-sm text-[#1a1a1ae6] leading-normal focus-visible:z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-l-none"
                       id="cvc" placeholder="CVC">
              </div>
              <p v-if="inputExpiryInvalid" class="grow text-xs text-red-500 italic">{{ inputExpiryInvalid }}</p>
              <p v-if="inputCvcInvalid" class="grow text-xs text-red-500 italic">{{ inputCvcInvalid }}</p>
            </div>
            <div v-if="!isGameModeCard" class="space-y-2">
              <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" for="cardholder-name">Cardholder name</label>
              <input @focusin="startGame()" :disabled="disableInputs" v-model="inputName" class="flex h-10 w-full rounded-md border px-3 py-2 bg-white text-sm text-[#1a1a1ae6] leading-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                     id="cardholder-name" placeholder="Full name" autocorrect="off" spellcheck="false" data-1p-ignore="true">
            </div>
            <div v-if="!isGameModeCard" class="space-y-2">
              <div class="flex justify-between">
                <label for="billing-address-fieldset">
                  <span class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Billing address</span>
                </label>
              </div>
              <fieldset class="border-none ml-0 mr-0 my-1 p-0" id="billing-address-fieldset">
                <div class="flex flex-wrap relative">
                  <div class="w-full flex-initial max-w-full">
                    <div class="relative">
                      <select @focusin="startGame()" :disabled="disableInputs" v-model="inputCountry" id="billingCountry" name="billingCountry" aria-label="Country" autocorrect="off" class="appearance-none flex h-10 w-full rounded-t-md border px-3 py-2 text-sm text-[#1a1a1ae6] leading-normal focus-visible:z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50">
                        <CountrySelectorOptions />
                      </select>
                      <svg class="h-3 mt-[calc(12px*-.5)] pointer-events-none absolute right-[12px] top-1/2 w-3 z-[3]" focusable="false" viewBox="0 0 12 12">
                        <path d="M10.193 3.97a.75.75 0 0 1 1.062 1.062L6.53 9.756a.75.75 0 0 1-1.06 0L.745 5.032A.75.75 0 0 1 1.807 3.97L6 8.163l4.193-4.193z" fill-rule="evenodd"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="w-full flex-initial max-w-full min-w-0">
                    <div class="relative">
                      <span class="block mt-[2px] relative w-full">
                        <input @focusin="startGame()" :disabled="disableInputs" v-model="inputAddressOne" class="flex h-10 w-full rounded-none border px-3 py-2 bg-white text-sm text-[#1a1a1ae6] leading-normal focus-visible:z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                               autocorrect="off" spellcheck="false" id="billingAddressLine1" name="billingAddressLine1" type="text" aria-label="Address line 1" placeholder="Address line 1" data-1p-ignore="true">
                      </span>
                    </div>
                  </div>
                  <div class="w-full flex-initial max-w-full min-w-0">
                    <div class="relative">
                      <span class="block mt-[2px] relative w-full">
                        <input @focusin="startGame()" :disabled="disableInputs" v-model="inputAddressTwo" class="appearance-none flex h-10 w-full rounded-none border px-3 py-2 bg-white text-sm text-[#1a1a1ae6] leading-normal focus-visible:z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                               autocorrect="off" spellcheck="false" id="billingAddressLine2" name="billingAddressLine2" type="text" aria-label="Address line 2" placeholder="Address line 2" data-1p-ignore="true">
                      </span>
                    </div>
                  </div>
                  <div class="w-full flex-initial max-w-full min-w-0">
                    <div class="relative">
                      <span class="block mt-[2px] relative w-full">
                        <input @focusin="startGame()" :disabled="disableInputs" v-model="inputCity" class="appearance-none flex h-10 w-full rounded-none border px-3 py-2 bg-white text-sm text-[#1a1a1ae6] leading-normal focus-visible:z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                               autocorrect="off" spellcheck="false" id="billingCity" name="billingCity" type="text" aria-label="City" placeholder="City" data-1p-ignore="true">
                      </span>
                    </div>
                  </div>
                  <div class="w-full flex-initial max-w-full min-w-0">
                    <div class="relative">
                      <span class="block mt-[2px] relative w-full">
                        <input @focusin="startGame()" :disabled="disableInputs" v-model="inputZipCode" class="appearance-none flex h-10 w-full rounded-b-md border px-3 py-2 bg-white text-sm text-[#1a1a1ae6] leading-normal focus-visible:z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                               autocorrect="off" spellcheck="false" id="billingZipCode" name="billingZipCode" type="text" aria-label="Zipcode" placeholder="Zipcode" data-1p-ignore="true">
                      </span>
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>
          </div>
          <div class="flex items-center px-6 pt-6 pb-2">
            <button :disabled="disableInputs" @click="stopGame()" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/90 h-10 px-4 py-2 ml-auto w-full bg-[#0A2540] text-white">Pay (ends timer)</button>
          </div>
          <p class="text-center text-xs italic underline pb-6">Reminder: this is a game, not a real checkout form. You will not be billed.</p>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
