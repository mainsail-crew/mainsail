import { GetterTree } from 'vuex'
import { ServerJobQueueState, ServerJobQueueStateJob } from '@/store/server/jobQueue/types'
import Vue from 'vue'
import { thumbnailBigMin, thumbnailSmallMax, thumbnailSmallMin } from '@/store/variables'

// eslint-disable-next-line
export const getters: GetterTree<ServerJobQueueState, any> = {
    getJobs: (state, getters, rootState, rootGetters) => {
        const jobs: ServerJobQueueStateJob[] = []

        state.queued_jobs.forEach((queuedJob) => {
            const job = { ...queuedJob }

            if (jobs.length && jobs[jobs.length - 1].filename === job.filename) {
                jobs[jobs.length - 1].combinedIds?.push(job.job_id)
                return
            }

            const file = rootGetters['files/getFile']('gcodes/' + job.filename)
            if (!file?.metadataPulled)
                Vue.$socket.emit('server.files.metadata', { filename: job.filename }, { action: 'files/getMetadata' })
            job.metadata = file
            job.combinedIds = []

            jobs.push(job)
        })

        return jobs
    },

    getJobsCount: (state) => {
        return state.queued_jobs.length
    },

    getSmallThumbnail: (state, getters, rootState, rootGetters) => (item: ServerJobQueueStateJob) => {
        if (item?.metadata?.thumbnails?.length) {
            const thumbnail = item?.metadata?.thumbnails.find(
                (thumb: any) =>
                    thumb.width >= thumbnailSmallMin &&
                    thumb.width <= thumbnailSmallMax &&
                    thumb.height >= thumbnailSmallMin &&
                    thumb.height <= thumbnailSmallMax
            )
            const path =
                item.filename.lastIndexOf('/') !== -1
                    ? 'gcodes/' + item.filename.slice(0, item.filename.lastIndexOf('/'))
                    : 'gcodes'

            if (thumbnail && 'relative_path' in thumbnail)
                return (
                    rootGetters['socket/getUrl'] +
                    '/server/files/' +
                    path +
                    '/' +
                    encodeURI(thumbnail.relative_path) +
                    '?timestamp=' +
                    item.metadata?.modified.getTime()
                )
        }

        return ''
    },

    getBigThumbnail: (state, getters, rootState, rootGetters) => (item: ServerJobQueueStateJob) => {
        if (item?.metadata?.thumbnails?.length) {
            const thumbnail = item?.metadata?.thumbnails.find((thumb: any) => thumb.width >= thumbnailBigMin)
            const path =
                item.filename.lastIndexOf('/') !== -1
                    ? 'gcodes/' + item.filename.slice(0, item.filename.lastIndexOf('/'))
                    : 'gcodes'

            if (thumbnail && 'relative_path' in thumbnail)
                return (
                    rootGetters['socket/getUrl'] +
                    '/server/files/' +
                    path +
                    '/' +
                    encodeURI(thumbnail.relative_path) +
                    '?timestamp=' +
                    item.metadata?.modified.getTime()
                )
        }

        return ''
    },
}
