<script setup>
const timer = ref()
const cardNumber = ref('')
const concludingMessage = ref("GOGoGOGO11!1!! Ur product manager and a senior engineer are already judging you.");
const showConcludingMessage = ref(false);
const hasAcceptedTerms = ref(false);

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

      setTimeout(() => {
        timer.value.stop(); // Stop the timer after 60 seconds
        concludingMessage.value = "Longer than 20sec? Rly? Ur fired.";
      }, 20000);
    }
  });
});

const limitCardNumberLength = () => {
  if (cardNumber.value.length > 16) {
    cardNumber.value = cardNumber.value.slice(0, 16);
  }
};

const checkResult = () => {
  if (cardNumber.value === '4242424242424242') {

    //different messages every 10 seconds of timer.value.getTime. Lower is better
    if (timer.value.getTime() < 4) {
      concludingMessage.value = 'You are a 10x engineer! wtf omg so fast';
    } else if (timer.value.getTime() < 5) {
      concludingMessage.value = 'You are a 5x engineer! teh fuak so fast!';
    } else if (timer.value.getTime() < 8) {
      concludingMessage.value = 'You are a 2x engineer! Not bad!';
    } else if (timer.value.getTime() < 10) {
      concludingMessage.value = 'You are a 1x engineer! Lol like.. just normal.';
    } else if (timer.value.getTime() < 15) {
      concludingMessage.value = 'You are a 0.5x engineer! You are on thin ice!';
    }

    showConcludingMessage.value = true;
  }
}

class Timer {
  constructor() {
    this.time = 0; // Initialize time to 0 seconds
    this.intervalId = null; // Initialize intervalId to null
  }

  start() {
    if (this.intervalId !== null) return; // Prevent multiple intervals

    this.intervalId = setInterval(() => {
      this.time += 0.01; // Increment time by 1 second
    }, 10); // Set interval to 1 second
  }

  stop() {
    if (this.intervalId === null) return; // If no interval is running, do nothing

    clearInterval(this.intervalId); // Clear the interval
    this.intervalId = null; // Reset intervalId to null

    checkResult();
  }

  getTime() {
    return this.time; // Return the current time
  }
}
</script>

<template>
  <div class="min-w-full min-h-full h-100%">
    <div class="flex flex-col lg:flex-row">

      <div class="lg:w-[40%] bg-indigo-600 font-mono text-white p-4">
        <div class="h-full flex flex-col justify-between">
          <div class="w-full">
            <h1 class="text-2xl text-center mt-8 lg:mt-16">4242.pro</h1>
            <p class="text-center my-2 mx-4">👀 Let's see if ur a 10x engineer or a n00b, your goal is to fill this checkout form asap.</p>

            <template v-if="!hasAcceptedTerms">
              <p class="text-center mt-16 mb-2 mx-4 italic">First, please click the button below to confirm you understand this is a GAME and not REAL. If you enter your real CC details, I WILL charge you! Be warned. Okay now that you have read this, click the button below and show me ur sk1lz.</p>
              <button @click="hasAcceptedTerms = true" class="mt-4 flex mx-auto bg-white text-indigo-600 rounded-lg px-4 py-2">Yes, I understand the above m8 dw</button>
            </template>
            <template v-else>
              <p class="mt-8 lg:mt-32 text-4xl text-center">{{ timer ? timer.getTime().toFixed(4) : '' }} seconds</p>
              <p class="my-8 text-3xl text-center" v-if="showConcludingMessage">{{ concludingMessage }}</p>
            </template>
          </div>
          <div class="mt-32 lg:mt-0 text-sm text-center">
            <p>Made by <a href="https://x.com/erwin_ai" target="_blank" class="cursor-pointer underline hover:text-gray-200">@Erwin_AI</a>. I got inspired after having to enter these details four hundred trillion times. May the 4 be with you 2!</p>
          </div>
        </div>
      </div>

      <div class="lg:w-[40%] bg-gray-100">

        <div class="my-16 mx-auto rounded-lg w-full max-w-lg">
          <div class="flex flex-col space-y-1.5 p-6">
            <h3 class="whitespace-nowrap text-2xl font-semibold leading-none tracking-tight">Pay with card</h3>
          </div>
          <div class="p-6 space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" for="email">Email</label>
              <input :disabled="!hasAcceptedTerms" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                     id="email" placeholder="imightspamyoul8ter@justkiddingiwont.com" type="email" value="">
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Card information</label>
              <div class="relative w-full bg-white">
                <div class="relative">
                  <span class="block m-0 p-0 relative w-full">
                    <input :disabled="!hasAcceptedTerms" @input="limitCardNumberLength" @focusin="timer.start()" v-model="cardNumber" class="rounded-none appearance-none bg-white border-0 text-[#1a1a1ae6] text-[16px] h-11 leading-normal px-3 py-2 relative transition-[box-shadow_0.08s_ease-in,color_0.08s_ease-in,filter_50000s] w-full animate-[1ms_ease_0s_1_normal_none_running_native-autofill-out] overflow-visible m-0"
                           autocorrect="off" spellcheck="false" id="cardNumber" name="cardNumber" type="text" inputmode="numeric" aria-label="cardnumber" placeholder="1234 1234 1234 1234" aria-invalid="false" aria-describedby="" data-1p-ignore="false">
                  </span>
                </div>
                <div class="flex items-center pointer-events-none absolute right-0 top-0 h-full pr-2 z-[3]" style="opacity: 1;">
                  <div style="transform: none;">
            <span class="flex items-center pointer-events-none pr-1 z-[3]">
              <img src="/visa.svg" alt="Visa" class="h-4 border-none" loading="lazy">
            </span>
                  </div>
                  <div style="transform: none;">
            <span class="flex items-center pointer-events-none pr-1 z-[3]">
              <img src="/mastercard.svg" alt="MasterCard" class="h-4 border-none" loading="lazy">
            </span>
                  </div>
                  <div style="transform: none;">
            <span class="flex items-center pointer-events-none pr-1 z-[3]">
              <img src="/amex.svg" alt="American Express" class="h-4 border-none" loading="lazy">
            </span>
                  </div>
                  <div class="relative flex items-center h-4 w-7">
            <span class="card-icon opacity-100 scale-100 absolute top-0 left-0 transition-all duration-400 ease-[0.15s]" role="presentation">
              <span class="flex items-center pointer-events-none pr-1 z-[3]" role="presentation">
                <img src="/unionpay.svg" alt="UnionPay" class="h-4 border-none" loading="lazy">
              </span>
            </span>
                    <span class="card-icon opacity-0 scale-[0.9] absolute top-0 left-0 transition-all duration-400 ease-[0.15s]" role="presentation">
              <span class="flex items-center pointer-events-none pr-1 z-[3]" role="presentation">
                <img src="/jcb.svg" alt="JCB" class="h-4 border-none" loading="lazy">
              </span>
            </span>
                    <span class="card-icon opacity-0 scale-[0.9] absolute top-0 left-0 transition-all duration-400 ease-[0.15s]" role="presentation">
              <span class="flex items-center pointer-events-none pr-1 z-[3]" role="presentation">
                <img src="/discover.svg" alt="Discover" class="h-4 border-none" loading="lazy">
              </span>
            </span>
                    <span class="card-icon opacity-0 scale-[0.9] absolute top-0 left-0 transition-all duration-400 ease-[0.15s]" role="presentation">
              <span class="flex items-center pointer-events-none pr-1 z-[3]" role="presentation">
                <img src="/diners.svg" alt="Diners Club" class="h-4 border-none" loading="lazy">
              </span>
            </span>
                  </div>
                </div>
              </div>
              <div class="grid grid-cols-[1fr_1fr] items-center gap-0">
                <input :disabled="!hasAcceptedTerms" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-r-none"
                       id="expiry" placeholder="MM / JJ">
                <input :disabled="!hasAcceptedTerms" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-l-none"
                       id="cvc" placeholder="CVC">
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" for="cardholder-name">Cardholder name</label>
              <input :disabled="!hasAcceptedTerms" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                     id="cardholder-name" placeholder="Full name">
            </div>
            <div class="space-y-2" data-qa="FormFieldGroup-billing-address">
              <div class="flex justify-between">
                <label for="billing-address-fieldset">
                  <span class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Billing address</span>
                </label>
              </div>
              <fieldset class="border-none ml-0 mr-0 my-1 p-0" id="billing-address-fieldset">
                <div class="flex flex-wrap relative">
                  <div class="w-full flex-initial max-w-full min-w-0">
                    <div class="relative">
                      <select id="billingCountry" name="billingCountry" autocomplete="billing country" aria-label="Land of regio" class="min-[992px]:text-[14px] min-[992px]:h-9 rounded-none appearance-none bg-white border-0 text-[#1a1a1ae6] text-[16px] h-11 leading-normal pr-8 transition-[box-shadow_0.08s_ease-in,color_0.08s_ease-in,filter_50000s] w-full normal-case m-0 px-4">
                        <CountrySelectorOptions />
                      </select>
                      <svg class="h-3 mt-[calc(12px*-.5)] pointer-events-none absolute right-[12px] top-1/2 w-3 z-[3]" focusable="false" viewBox="0 0 12 12">
                        <path d="M10.193 3.97a.75.75 0 0 1 1.062 1.062L6.53 9.756a.75.75 0 0 1-1.06 0L.745 5.032A.75.75 0 0 1 1.807 3.97L6 8.163l4.193-4.193z" fill-rule="evenodd"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="w-full flex-initial max-w-full min-w-0">
                    <div class="relative">
              <span class="block m-0 p-0 relative w-full">
                <input :disabled="!hasAcceptedTerms" class="min-[992px]:text-[14px] min-[992px]:h-9 rounded-none appearance-none bg-white border-0 text-[#1a1a1ae6] text-[16px] h-11 leading-normal px-3 py-2 relative transition-[box-shadow_0.08s_ease-in,color_0.08s_ease-in,filter_50000s] w-full animate-[1ms_ease_0s_1_normal_none_running_native-autofill-out] overflow-visible m-0"
                       autocomplete="billing address-line1" autocorrect="off" spellcheck="false" id="billingAddressLine1" name="billingAddressLine1" type="text" aria-label="Address line 1" placeholder="Address line 1" aria-invalid="false" aria-describedby="" data-1p-ignore="false" value="">
              </span>
                    </div>
                  </div>
                  <div class="w-full flex-initial max-w-full min-w-0">
                    <div class="relative">
              <span class="block m-0 p-0 relative w-full">
                <input :disabled="!hasAcceptedTerms" class="min-[992px]:text-[14px] min-[992px]:h-9 rounded-none appearance-none bg-white border-0 text-[#1a1a1ae6] text-[16px] h-11 leading-normal px-3 py-2 relative transition-[box-shadow_0.08s_ease-in,color_0.08s_ease-in,filter_50000s] w-full animate-[1ms_ease_0s_1_normal_none_running_native-autofill-out] overflow-visible m-0"
                       autocomplete="billing address-line2" autocorrect="off" spellcheck="false" id="billingAddressLine2" name="billingAddressLine2" type="text" aria-label="Address line 2" placeholder="Address line 2" aria-invalid="false" aria-describedby="" data-1p-ignore="false" value="">
              </span>
                    </div>
                  </div>
                  <div class="w-full flex-initial max-w-full min-w-0">
                    <div class="relative">
              <span class="block m-0 p-0 relative w-full">
                <input :disabled="!hasAcceptedTerms" class="min-[992px]:text-[14px] min-[992px]:h-9 rounded-none appearance-none bg-white border-0 text-[#1a1a1ae6] text-[16px] h-11 leading-normal px-3 py-2 relative transition-[box-shadow_0.08s_ease-in,color_0.08s_ease-in,filter_50000s] w-full animate-[1ms_ease_0s_1_normal_none_running_native-autofill-out] overflow-visible m-0"
                       autocomplete="billing address-level2" autocorrect="off" spellcheck="false" id="billingLocality" name="billingLocality" type="text" aria-label="City" placeholder="City" aria-invalid="false" aria-describedby="" data-1p-ignore="false" value="">
              </span>
                    </div>
                  </div>
                  <div class="w-full flex-initial max-w-full min-w-0">
                    <div class="relative">
              <span class="block m-0 p-0 relative w-full">
                <input :disabled="!hasAcceptedTerms" class="min-[992px]:text-[14px] min-[992px]:h-9 rounded-none appearance-none bg-white border-0 text-[#1a1a1ae6] text-[16px] h-11 leading-normal px-3 py-2 relative transition-[box-shadow_0.08s_ease-in,color_0.08s_ease-in,filter_50000s] w-full animate-[1ms_ease_0s_1_normal_none_running_native-autofill-out] overflow-visible m-0"
                       autocomplete="billing postal-code" autocorrect="off" spellcheck="false" id="billingPostalCode" name="billingPostalCode" type="text" aria-label="Zipcode" placeholder="Zipcode" aria-invalid="false" aria-describedby="" data-1p-ignore="false" value="">
              </span>
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>
          </div>
          <div class="flex items-center p-6">
            <button :disabled="!hasAcceptedTerms" @click="timer.stop()" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/90 h-10 px-4 py-2 ml-auto w-full bg-[#0A2540] text-white">Pay (ends timer)</button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
