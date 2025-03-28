<template>
  <div class="w-full lg:w-1/2 relative z-[3] p-8 flex flex-col gap-8 order-2 lg:order-1">
    <!-- Branding -->
    <div class="flex items-center gap-4">
      <img 
        src="../../assets/ADOG.png" 
        alt="AlwaysDog" 
        class="w-16 h-16 rounded-full"
      />
      <div>
        <p class="text-lg italic text-primary mt-1">
          "Always DOG, Always MEME!"
        </p>
        <p class="text-lg opacity-80">Meme Coin Trading App</p>
      </div>
    </div>

    <!-- Description -->
    <div class="prose prose-invert max-w-none">
      <p class="text-lg leading-relaxed opacity-90">
        This is an experimental project designed to allow you to buy or sell multiple different Dog-themed MEME Coins in a single transaction.
      </p>
    </div>

    <!-- Fee Structure Card -->
    <div class="card bg-base-200/50 backdrop-blur-sm">
      <div class="card-body">
        <h2 class="card-title text-xl flex items-center gap-2">
          <i class="fas fa-coins text-primary"></i>
          Transaction Fees
        </h2>
        <div class="space-y-4">
          <div class="flex items-start gap-3">
            <div class="bg-success/10 p-2 rounded-lg">
              <i class="fas fa-shopping-cart text-success"></i>
            </div>
            <div>
              <h3 class="font-semibold text-success mb-1">Purchase Fee</h3>
              <p class="opacity-90">
                0.0001 BNB per purchase (current setting)
              </p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <div class="bg-error/10 p-2 rounded-lg">
              <i class="fas fa-cash-register text-error"></i>
            </div>
            <div>
              <h3 class="font-semibold text-error mb-1">Sale Fee</h3>
              <p class="opacity-90">No fees are charged for sales.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- DEX Info Card -->
    <div class="card bg-base-200/50 backdrop-blur-sm">
      <div class="card-body">
        <h2 class="card-title text-xl flex items-center gap-2">
          <i class="fas fa-exchange-alt text-primary"></i>
          DEX & Supported Coins
        </h2>
        <p class="opacity-90">
          AlwaysDog utilizes <a 
            href="https://pancakeswap.finance/?chain=bsc" 
            target="_blank" 
            class="text-primary hover:text-primary-focus hover:underline inline-flex items-center gap-1"
          >
            <img 
              src="../../assets/pancakeswap.svg" 
              alt="PancakeSwap" 
              class="w-4 h-4"
            />
            <span>PancakeSwap</span>
          </a> as the DEX for transaction execution. The MEME Coins supported are currently determined by this project, with future plans to consider a gradual transition to community governance (depending on the project's success).
        </p>
      </div>
    </div>
  </div>
</template> 