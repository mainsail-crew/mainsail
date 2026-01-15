import { ref } from 'vue'

// This file is used to track the number of times the PWA has been launched
// via launchQueue. This has been extracted from the launch handler because
// if it is present in the launch handler, it will be reset during hot reload.
// This throws off the functionality that determines if it is a new launch,
// causing new launches to be treated as a relaunch and get ignored.
export const launchCount = ref(0)
