<template>
  <div class="bg-gray-100 min-h-screen py-20 pt-40">
    <div class="container mx-auto px-6 text-center">
      <h1 class="text-5xl font-bold mb-4">下载扩展</h1>
      <p class="text-gray-600 mb-12">请为您的应用程序选择对应的扩展进行下载</p>

      <div class="flex flex-col md:flex-row justify-center items-center gap-8">
        <!-- AE Extension Card -->
        <div class="bg-white p-8 rounded-lg shadow-lg w-full md:w-1/3">
          <img src="https://placehold.co/150x150/a78bfa/ffffff?text=AE" alt="After Effects Logo" class="mx-auto mb-4 rounded-full">
          <h2 class="text-3xl font-bold mb-2">After Effects 扩展</h2>
          <p class="text-gray-500 mb-6">适用于 AE CC 2018 及以上版本</p>
          <a href="#" class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 inline-block">下载 AE 扩展</a>
        </div>

        <!-- Eagle Extension Card -->
        <div class="bg-white p-8 rounded-lg shadow-lg w-full md:w-1/3">
          <img src="https://placehold.co/150x150/34d399/ffffff?text=Eagle" alt="Eagle Logo" class="mx-auto mb-4 rounded-full">
          <h2 class="text-3xl font-bold mb-2">Eagle 扩展</h2>
          <p class="text-gray-500 mb-6">适用于 Eagle 3.0 及以上版本</p>
          <a href="#" class="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 inline-block">下载 Eagle 扩展</a>
        </div>
      </div>

    </div>
  </div>
</template>
