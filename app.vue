<template>
  <div class="min-w-full min-h-full h-100%">
    <div class="lg:flex">

      <div class="w-[40%] bg-indigo-600">
        <h1 class=""></h1>
      </div>

      <div class="w-[40%] bg-gray-100">
        <div class="rounded-lg border shadow-sm w-full max-w-lg">
          <div class="flex flex-col space-y-1.5 p-6">
            <h3 class="whitespace-nowrap text-2xl font-semibold leading-none tracking-tight">Met kaart betalen</h3>
          </div>
          <div class="p-6 space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" for="email">E-mail</label>
              <input class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" id="email" placeholder="erwin+2222@remotedev.co" type="email" value="erwin+2222@remotedev.co">
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Kaartinformatie</label>
              <div class="relative w-full bg-white">
                <div class="relative">
              <span class="block m-0 p-0 relative w-full">
                <input class="rounded-none appearance-none bg-white border-0 shadow-[0_0_0_1px_#e0e0e0,0_2px_4px_0_rgba(0,0,0,0.07),0_1px_1.5px_0_rgba(0,0,0,0.05)] text-[#1a1a1ae6] text-[16px] h-11 leading-normal px-3 py-2 relative transition-[box-shadow_0.08s_ease-in,color_0.08s_ease-in,filter_50000s] w-full animate-[1ms_ease_0s_1_normal_none_running_native-autofill-out] overflow-visible m-0" autocomplete="cc-number" autocorrect="off" spellcheck="false" id="cardNumber" name="cardNumber" type="text" inputmode="numeric" aria-label="Kaartnummer" placeholder="1234 1234 1234 1234" aria-invalid="false" aria-describedby="" data-1p-ignore="false" value="">
              </span>
                </div>
                <div class="flex items-center pointer-events-none absolute right-0 top-0 h-full pr-2 z-[3]" style="opacity: 1;">
                  <div style="transform: none;">
                <span class="flex items-center pointer-events-none pr-1 z-[3]">
                  <img src="/visa.svg" alt="Visa" class="h-4 border-none" loading="lazy" fetchpriority="low">
                </span>
                  </div>
                  <div style="transform: none;">
                <span class="flex items-center pointer-events-none pr-1 z-[3]">
                  <img src="/mastercard.svg" alt="MasterCard" class="h-4 border-none" loading="lazy" fetchpriority="low">
                </span>
                  </div>
                  <div style="transform: none;">
                <span class="flex items-center pointer-events-none pr-1 z-[3]">
                  <img src="/amex.svg" alt="American Express" class="h-4 border-none" loading="lazy" fetchpriority="low">
                </span>
                  </div>
                  <div class="relative flex items-center h-4 w-7">
                <span class="card-icon opacity-100 scale-100 absolute top-0 left-0 transition-all duration-400 ease-[0.15s]" role="presentation">
                  <span class="flex items-center pointer-events-none pr-1 z-[3]" role="presentation">
                    <img src="/unionpay.svg" alt="UnionPay" class="h-4 border-none" loading="lazy" fetchpriority="low">
                  </span>
                </span>
                    <span class="card-icon opacity-0 scale-[0.9] absolute top-0 left-0 transition-all duration-400 ease-[0.15s]" role="presentation">
                  <span class="flex items-center pointer-events-none pr-1 z-[3]" role="presentation">
                    <img src="/jcb.svg" alt="JCB" class="h-4 border-none" loading="lazy" fetchpriority="low">
                  </span>
                </span>
                    <span class="card-icon opacity-0 scale-[0.9] absolute top-0 left-0 transition-all duration-400 ease-[0.15s]" role="presentation">
                  <span class="flex items-center pointer-events-none pr-1 z-[3]" role="presentation">
                    <img src="/discover.svg" alt="Discover" class="h-4 border-none" loading="lazy" fetchpriority="low">
                  </span>
                </span>
                    <span class="card-icon opacity-0 scale-[0.9] absolute top-0 left-0 transition-all duration-400 ease-[0.15s]" role="presentation">
                  <span class="flex items-center pointer-events-none pr-1 z-[3]" role="presentation">
                    <img src="/diners.svg" alt="Diners Club" class="h-4 border-none" loading="lazy" fetchpriority="low">
                  </span>
                </span>
                  </div>
                </div>
              </div>
              <div class="grid grid-cols-[1fr_1fr] items-center gap-0">
                <input class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-r-none" id="expiry" placeholder="MM / JJ">
                <input class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-l-none" id="cvc" placeholder="CVC">
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" for="cardholder-name">Naam kaarthouder</label>
              <input class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" id="cardholder-name" placeholder="Volledige naam">
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Factuuradres</label>
              <button type="button" role="combobox" aria-controls="radix-:r3:" aria-expanded="false" aria-autocomplete="none" dir="ltr" data-state="closed" data-placeholder="" class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" id="country" aria-label="Country">
                <span style="pointer-events: none;">Indonesië</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down h-4 w-4 opacity-50" aria-hidden="true">
                  <path d="m6 9 6 6 6-6"></path>
                </svg>
              </button>
              <input class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" id="address-line-1" placeholder="Adresregel 1">
              <input class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" id="address-line-2" placeholder="Adresregel 2">
              <input class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" id="city" placeholder="Stad">
              <input class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" id="province" placeholder="Provincie">
              <input class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" id="postal-code" placeholder="Postcode">
            </div>
          </div>
          <div class="flex items-center p-6">
            <button class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/90 h-10 px-4 py-2 ml-auto w-full bg-[#0A2540] text-white">Betalen</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>

onMounted(() => {
  document.addEventListener('DOMContentLoaded', function() {
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
  });
});


</script>

<style>
html {
  height: 100%;
  background-color: #f3f3f3;
}
body {
  height: 100%;
}

#__nuxt {
  height: 100%;
}
</style>
