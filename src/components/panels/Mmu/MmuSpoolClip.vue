<template>
    <svg width="100%" height="100%" viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <clipPath id="clip-half">
                <rect x="0" y="0" width="80" height="60" />
            </clipPath>
            <radialGradient id="spotlight" cx="50%" cy="70%" r="50%" fx="50%" fy="100%">
                <stop offset="0%" style="stop-color: rgba(255, 255, 255, 0.9); stop-opacity: 1" />
                <stop offset="100%" style="stop-color: rgba(255, 255, 0, 0); stop-opacity: 0" />
            </radialGradient>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#spotlight)" clip-path="url(#clip-half)" />
    </svg>
</template>

<style scoped></style>
