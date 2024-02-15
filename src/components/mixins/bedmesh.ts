import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class BedmeshMixin extends Vue {
    get bed_mesh() {
        return this.$store.state.printer.bed_mesh ?? {}
    }

    get profiles() {
        return this.bed_mesh.profiles ?? {}
    }

    get mesh_min() {
        return this.bed_mesh.mesh_min ?? [0, 0]
    }

    get mesh_max() {
        return this.bed_mesh.mesh_max ?? [0, 0]
    }

    get min() {
        return Math.min(...this.points)
    }

    get max() {
        return Math.max(...this.points)
    }

    get variance() {
        return Math.abs(this.min - this.max).toFixed(3)
    }

    get is_active() {
        // if the current profile_mane is not empty, return true
        if (this.bed_mesh.profile_name !== '') return true

        return this.mesh_min[0] !== 0 || this.mesh_min[1] !== 0 || this.mesh_max[0] !== 0 || this.mesh_max[1] !== 0
    }

    get name() {
        if (this.bed_mesh.profile_name !== '') return this.bed_mesh.profile_name

        return 'Unknown'
    }

    get probed_matrix() {
        return this.bed_mesh.probed_matrix ?? []
    }

    get points() {
        const points: number[] = []

        for (let i = 0; i < this.probed_matrix.length; i++) {
            for (let j = 0; j < this.probed_matrix[i].length; j++) {
                points.push(this.probed_matrix[i][j])
            }
        }

        return points
    }
}
