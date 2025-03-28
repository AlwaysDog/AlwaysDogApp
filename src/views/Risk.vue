<template>
  <div class="card bg-base-200/50 backdrop-blur-sm">
    <div class="card-body">
      <!-- Slippage Risk Section -->
      <div class="mb-6">
        <h2 class="card-title text-xl flex items-center gap-2 mb-4">
          <i class="fas fa-exclamation-circle text-warning"></i>
          Slippage Risk
        </h2>
        <p class="opacity-90">
          This application employs a simplified trading model that does not limit slippage. This means that during transaction execution, the final transaction price may deviate from your expected price. If you are sensitive to slippage or require more professional trading features or finer slippage control, it is highly recommended that you use other professional decentralized exchanges (DEXs). This application is more suitable for users seeking a simple and fast trading experience who are not sensitive to slippage.
        </p>
      </div>

      <!-- General Disclaimer Section -->
      <div class="bg-error/10 p-4 rounded-lg border border-error/20">
        <h3 class="text-error font-semibold mb-2 flex items-center gap-2">
          <i class="fas fa-exclamation-triangle"></i>
          General Project Disclaimer & Limitations
        </h3>
        <p class="text-sm opacity-90">
          This application is an experimental project. The developers will strive to maintain the stable operation of the application, but do not guarantee the continuity of its services or the absolute security of transactions. Users must bear the risks and losses that may arise from using this application, including but not limited to losses caused by slippage.
        </p>
      </div>
    </div>
  </div>
</template>
