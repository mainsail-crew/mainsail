<template>
    <v-simple-table>
        <template v-slot:default>
            <thead>
            <tr>
                <th class="text-left">Name</th>
                <th class="text-left">last modified</th>
                <th class="text-left">Filesize</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="file in files" :key="file.name">
                <td>{{ file.filename }}</td>
                <td>{{ file.modified }}</td>
                <td>{{ file.size }}</td>
            </tr>
            </tbody>
        </template>
    </v-simple-table>
</template>
<script>
    import { mapState } from 'vuex';

    export default {
        computed: {
            ...mapState({
                files: state => state.files
            })
        }
    }
</script>