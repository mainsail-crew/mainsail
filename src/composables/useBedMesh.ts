import { computed } from 'vue'
import { useStore } from 'vuex'

export function useBedMesh() {
    const store = useStore()

    const bed_mesh = computed(() => store.state.printer.bed_mesh ?? {})

    const profiles = computed(() => bed_mesh.value.profiles ?? {})

    const mesh_min = computed(() => bed_mesh.value.mesh_min ?? [0, 0])

    const mesh_max = computed(() => bed_mesh.value.mesh_max ?? [0, 0])

    const probed_matrix = computed(() => bed_mesh.value.probed_matrix ?? [])

    const points = computed(() => {
        const points: number[] = []
        const matrix = probed_matrix.value

        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                points.push(matrix[i][j])
            }
        }

        return points
    })

    const min = computed(() => Math.min(...points.value))

    const max = computed(() => Math.max(...points.value))

    const variance = computed(() => Math.abs(min.value - max.value).toFixed(3))

    const is_active = computed(() => {
        if (bed_mesh.value.profile_name !== '') return true

        return (
            mesh_min.value[0] !== 0 ||
            mesh_min.value[1] !== 0 ||
            mesh_max.value[0] !== 0 ||
            mesh_max.value[1] !== 0
        )
    })

    const name = computed(() => {
        if (bed_mesh.value.profile_name !== '') return bed_mesh.value.profile_name

        return 'Unknown'
    })

    return {
        bed_mesh,
        profiles,
        mesh_min,
        mesh_max,
        min,
        max,
        variance,
        is_active,
        name,
        probed_matrix,
        points,
    }
}
