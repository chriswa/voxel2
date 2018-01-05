// find the last entry in voxelSphereAreaByDistance for while the first element is <= your distance, the second element tells you how many sortedVoxelDistances elements to look at

export default {
	getSortedList(radius: number): Array< Array<number> > {
		let voxelCount = 1
		for (let i = 0; i < voxelSphereAreaByDistance.length; i += 1) {
			if (voxelSphereAreaByDistance[i][0] > radius) { break }
			voxelCount = voxelSphereAreaByDistance[i][1]
		}
		return sortedVoxelDistances.slice(0, voxelCount)
	}
}

const voxelSphereAreaByDistance = [[1, 7], [1.414, 19], [1.732, 27], [2, 33], [2.236, 57], [2.449, 81], [2.828, 93], [3, 123], [3.162, 147], [3.317, 171], [3.464, 179], [3.606, 203], [3.742, 251], [4, 257], [4.123, 305], [4.243, 341], [4.359, 365], [4.472, 389], [4.583, 437], [4.69, 461], [4.899, 485], [5, 515], [5.099, 587], [5.196, 619], [5.385, 691], [5.477, 739], [5.657, 751], [5.745, 799], [5.831, 847], [5.916, 895], [6, 925], [6.083, 949], [6.164, 1021], [6.325, 1045], [6.403, 1141], [6.481, 1189], [6.557, 1213], [6.633, 1237], [6.708, 1309], [6.782, 1357], [6.928, 1365], [7, 1419], [7.071, 1503], [7.141, 1551], [7.211, 1575], [7.28, 1647], [7.348, 1743], [7.483, 1791], [7.55, 1839], [7.616, 1863], [7.681, 1935], [7.81, 2007], [7.874, 2103], [8, 2109], [8.062, 2205], [8.124, 2301], [8.185, 2325], [8.246, 2373], [8.307, 2469], [8.367, 2517]]

const sortedVoxelDistances = [[0, 0, 0], [-1, 0, 0], [0, -1, 0], [0, 0, -1], [0, 0, 1], [0, 1, 0], [1, 0, 0], [-1, -1, 0], [-1, 0, -1], [-1, 0, 1], [-1, 1, 0], [0, -1, -1], [0, -1, 1], [0, 1, -1], [0, 1, 1], [1, -1, 0], [1, 0, -1], [1, 0, 1], [1, 1, 0], [-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1], [1, -1, -1], [1, -1, 1], [1, 1, -1], [1, 1, 1], [-2, 0, 0], [0, -2, 0], [0, 0, -2], [0, 0, 2], [0, 2, 0], [2, 0, 0], [-2, -1, 0], [-2, 0, -1], [-2, 0, 1], [-2, 1, 0], [-1, -2, 0], [-1, 0, -2], [-1, 0, 2], [-1, 2, 0], [0, -2, -1], [0, -2, 1], [0, -1, -2], [0, -1, 2], [0, 1, -2], [0, 1, 2], [0, 2, -1], [0, 2, 1], [1, -2, 0], [1, 0, -2], [1, 0, 2], [1, 2, 0], [2, -1, 0], [2, 0, -1], [2, 0, 1], [2, 1, 0], [-2, -1, -1], [-2, -1, 1], [-2, 1, -1], [-2, 1, 1], [-1, -2, -1], [-1, -2, 1], [-1, -1, -2], [-1, -1, 2], [-1, 1, -2], [-1, 1, 2], [-1, 2, -1], [-1, 2, 1], [1, -2, -1], [1, -2, 1], [1, -1, -2], [1, -1, 2], [1, 1, -2], [1, 1, 2], [1, 2, -1], [1, 2, 1], [2, -1, -1], [2, -1, 1], [2, 1, -1], [2, 1, 1], [-2, -2, 0], [-2, 0, -2], [-2, 0, 2], [-2, 2, 0], [0, -2, -2], [0, -2, 2], [0, 2, -2], [0, 2, 2], [2, -2, 0], [2, 0, -2], [2, 0, 2], [2, 2, 0], [-3, 0, 0], [-2, -2, -1], [-2, -2, 1], [-2, -1, -2], [-2, -1, 2], [-2, 1, -2], [-2, 1, 2], [-2, 2, -1], [-2, 2, 1], [-1, -2, -2], [-1, -2, 2], [-1, 2, -2], [-1, 2, 2], [0, -3, 0], [0, 0, -3], [0, 0, 3], [0, 3, 0], [1, -2, -2], [1, -2, 2], [1, 2, -2], [1, 2, 2], [2, -2, -1], [2, -2, 1], [2, -1, -2], [2, -1, 2], [2, 1, -2], [2, 1, 2], [2, 2, -1], [2, 2, 1], [3, 0, 0], [-3, -1, 0], [-3, 0, -1], [-3, 0, 1], [-3, 1, 0], [-1, -3, 0], [-1, 0, -3], [-1, 0, 3], [-1, 3, 0], [0, -3, -1], [0, -3, 1], [0, -1, -3], [0, -1, 3], [0, 1, -3], [0, 1, 3], [0, 3, -1], [0, 3, 1], [1, -3, 0], [1, 0, -3], [1, 0, 3], [1, 3, 0], [3, -1, 0], [3, 0, -1], [3, 0, 1], [3, 1, 0], [-3, -1, -1], [-3, -1, 1], [-3, 1, -1], [-3, 1, 1], [-1, -3, -1], [-1, -3, 1], [-1, -1, -3], [-1, -1, 3], [-1, 1, -3], [-1, 1, 3], [-1, 3, -1], [-1, 3, 1], [1, -3, -1], [1, -3, 1], [1, -1, -3], [1, -1, 3], [1, 1, -3], [1, 1, 3], [1, 3, -1], [1, 3, 1], [3, -1, -1], [3, -1, 1], [3, 1, -1], [3, 1, 1], [-2, -2, -2], [-2, -2, 2], [-2, 2, -2], [-2, 2, 2], [2, -2, -2], [2, -2, 2], [2, 2, -2], [2, 2, 2], [-3, -2, 0], [-3, 0, -2], [-3, 0, 2], [-3, 2, 0], [-2, -3, 0], [-2, 0, -3], [-2, 0, 3], [-2, 3, 0], [0, -3, -2], [0, -3, 2], [0, -2, -3], [0, -2, 3], [0, 2, -3], [0, 2, 3], [0, 3, -2], [0, 3, 2], [2, -3, 0], [2, 0, -3], [2, 0, 3], [2, 3, 0], [3, -2, 0], [3, 0, -2], [3, 0, 2], [3, 2, 0], [-3, -2, -1], [-3, -2, 1], [-3, -1, -2], [-3, -1, 2], [-3, 1, -2], [-3, 1, 2], [-3, 2, -1], [-3, 2, 1], [-2, -3, -1], [-2, -3, 1], [-2, -1, -3], [-2, -1, 3], [-2, 1, -3], [-2, 1, 3], [-2, 3, -1], [-2, 3, 1], [-1, -3, -2], [-1, -3, 2], [-1, -2, -3], [-1, -2, 3], [-1, 2, -3], [-1, 2, 3], [-1, 3, -2], [-1, 3, 2], [1, -3, -2], [1, -3, 2], [1, -2, -3], [1, -2, 3], [1, 2, -3], [1, 2, 3], [1, 3, -2], [1, 3, 2], [2, -3, -1], [2, -3, 1], [2, -1, -3], [2, -1, 3], [2, 1, -3], [2, 1, 3], [2, 3, -1], [2, 3, 1], [3, -2, -1], [3, -2, 1], [3, -1, -2], [3, -1, 2], [3, 1, -2], [3, 1, 2], [3, 2, -1], [3, 2, 1], [-4, 0, 0], [0, -4, 0], [0, 0, -4], [0, 0, 4], [0, 4, 0], [4, 0, 0], [-4, -1, 0], [-4, 0, -1], [-4, 0, 1], [-4, 1, 0], [-3, -2, -2], [-3, -2, 2], [-3, 2, -2], [-3, 2, 2], [-2, -3, -2], [-2, -3, 2], [-2, -2, -3], [-2, -2, 3], [-2, 2, -3], [-2, 2, 3], [-2, 3, -2], [-2, 3, 2], [-1, -4, 0], [-1, 0, -4], [-1, 0, 4], [-1, 4, 0], [0, -4, -1], [0, -4, 1], [0, -1, -4], [0, -1, 4], [0, 1, -4], [0, 1, 4], [0, 4, -1], [0, 4, 1], [1, -4, 0], [1, 0, -4], [1, 0, 4], [1, 4, 0], [2, -3, -2], [2, -3, 2], [2, -2, -3], [2, -2, 3], [2, 2, -3], [2, 2, 3], [2, 3, -2], [2, 3, 2], [3, -2, -2], [3, -2, 2], [3, 2, -2], [3, 2, 2], [4, -1, 0], [4, 0, -1], [4, 0, 1], [4, 1, 0], [-4, -1, -1], [-4, -1, 1], [-4, 1, -1], [-4, 1, 1], [-3, -3, 0], [-3, 0, -3], [-3, 0, 3], [-3, 3, 0], [-1, -4, -1], [-1, -4, 1], [-1, -1, -4], [-1, -1, 4], [-1, 1, -4], [-1, 1, 4], [-1, 4, -1], [-1, 4, 1], [0, -3, -3], [0, -3, 3], [0, 3, -3], [0, 3, 3], [1, -4, -1], [1, -4, 1], [1, -1, -4], [1, -1, 4], [1, 1, -4], [1, 1, 4], [1, 4, -1], [1, 4, 1], [3, -3, 0], [3, 0, -3], [3, 0, 3], [3, 3, 0], [4, -1, -1], [4, -1, 1], [4, 1, -1], [4, 1, 1], [-3, -3, -1], [-3, -3, 1], [-3, -1, -3], [-3, -1, 3], [-3, 1, -3], [-3, 1, 3], [-3, 3, -1], [-3, 3, 1], [-1, -3, -3], [-1, -3, 3], [-1, 3, -3], [-1, 3, 3], [1, -3, -3], [1, -3, 3], [1, 3, -3], [1, 3, 3], [3, -3, -1], [3, -3, 1], [3, -1, -3], [3, -1, 3], [3, 1, -3], [3, 1, 3], [3, 3, -1], [3, 3, 1], [-4, -2, 0], [-4, 0, -2], [-4, 0, 2], [-4, 2, 0], [-2, -4, 0], [-2, 0, -4], [-2, 0, 4], [-2, 4, 0], [0, -4, -2], [0, -4, 2], [0, -2, -4], [0, -2, 4], [0, 2, -4], [0, 2, 4], [0, 4, -2], [0, 4, 2], [2, -4, 0], [2, 0, -4], [2, 0, 4], [2, 4, 0], [4, -2, 0], [4, 0, -2], [4, 0, 2], [4, 2, 0], [-4, -2, -1], [-4, -2, 1], [-4, -1, -2], [-4, -1, 2], [-4, 1, -2], [-4, 1, 2], [-4, 2, -1], [-4, 2, 1], [-2, -4, -1], [-2, -4, 1], [-2, -1, -4], [-2, -1, 4], [-2, 1, -4], [-2, 1, 4], [-2, 4, -1], [-2, 4, 1], [-1, -4, -2], [-1, -4, 2], [-1, -2, -4], [-1, -2, 4], [-1, 2, -4], [-1, 2, 4], [-1, 4, -2], [-1, 4, 2], [1, -4, -2], [1, -4, 2], [1, -2, -4], [1, -2, 4], [1, 2, -4], [1, 2, 4], [1, 4, -2], [1, 4, 2], [2, -4, -1], [2, -4, 1], [2, -1, -4], [2, -1, 4], [2, 1, -4], [2, 1, 4], [2, 4, -1], [2, 4, 1], [4, -2, -1], [4, -2, 1], [4, -1, -2], [4, -1, 2], [4, 1, -2], [4, 1, 2], [4, 2, -1], [4, 2, 1], [-3, -3, -2], [-3, -3, 2], [-3, -2, -3], [-3, -2, 3], [-3, 2, -3], [-3, 2, 3], [-3, 3, -2], [-3, 3, 2], [-2, -3, -3], [-2, -3, 3], [-2, 3, -3], [-2, 3, 3], [2, -3, -3], [2, -3, 3], [2, 3, -3], [2, 3, 3], [3, -3, -2], [3, -3, 2], [3, -2, -3], [3, -2, 3], [3, 2, -3], [3, 2, 3], [3, 3, -2], [3, 3, 2], [-4, -2, -2], [-4, -2, 2], [-4, 2, -2], [-4, 2, 2], [-2, -4, -2], [-2, -4, 2], [-2, -2, -4], [-2, -2, 4], [-2, 2, -4], [-2, 2, 4], [-2, 4, -2], [-2, 4, 2], [2, -4, -2], [2, -4, 2], [2, -2, -4], [2, -2, 4], [2, 2, -4], [2, 2, 4], [2, 4, -2], [2, 4, 2], [4, -2, -2], [4, -2, 2], [4, 2, -2], [4, 2, 2], [-5, 0, 0], [-4, -3, 0], [-4, 0, -3], [-4, 0, 3], [-4, 3, 0], [-3, -4, 0], [-3, 0, -4], [-3, 0, 4], [-3, 4, 0], [0, -5, 0], [0, -4, -3], [0, -4, 3], [0, -3, -4], [0, -3, 4], [0, 0, -5], [0, 0, 5], [0, 3, -4], [0, 3, 4], [0, 4, -3], [0, 4, 3], [0, 5, 0], [3, -4, 0], [3, 0, -4], [3, 0, 4], [3, 4, 0], [4, -3, 0], [4, 0, -3], [4, 0, 3], [4, 3, 0], [5, 0, 0], [-5, -1, 0], [-5, 0, -1], [-5, 0, 1], [-5, 1, 0], [-4, -3, -1], [-4, -3, 1], [-4, -1, -3], [-4, -1, 3], [-4, 1, -3], [-4, 1, 3], [-4, 3, -1], [-4, 3, 1], [-3, -4, -1], [-3, -4, 1], [-3, -1, -4], [-3, -1, 4], [-3, 1, -4], [-3, 1, 4], [-3, 4, -1], [-3, 4, 1], [-1, -5, 0], [-1, -4, -3], [-1, -4, 3], [-1, -3, -4], [-1, -3, 4], [-1, 0, -5], [-1, 0, 5], [-1, 3, -4], [-1, 3, 4], [-1, 4, -3], [-1, 4, 3], [-1, 5, 0], [0, -5, -1], [0, -5, 1], [0, -1, -5], [0, -1, 5], [0, 1, -5], [0, 1, 5], [0, 5, -1], [0, 5, 1], [1, -5, 0], [1, -4, -3], [1, -4, 3], [1, -3, -4], [1, -3, 4], [1, 0, -5], [1, 0, 5], [1, 3, -4], [1, 3, 4], [1, 4, -3], [1, 4, 3], [1, 5, 0], [3, -4, -1], [3, -4, 1], [3, -1, -4], [3, -1, 4], [3, 1, -4], [3, 1, 4], [3, 4, -1], [3, 4, 1], [4, -3, -1], [4, -3, 1], [4, -1, -3], [4, -1, 3], [4, 1, -3], [4, 1, 3], [4, 3, -1], [4, 3, 1], [5, -1, 0], [5, 0, -1], [5, 0, 1], [5, 1, 0], [-5, -1, -1], [-5, -1, 1], [-5, 1, -1], [-5, 1, 1], [-3, -3, -3], [-3, -3, 3], [-3, 3, -3], [-3, 3, 3], [-1, -5, -1], [-1, -5, 1], [-1, -1, -5], [-1, -1, 5], [-1, 1, -5], [-1, 1, 5], [-1, 5, -1], [-1, 5, 1], [1, -5, -1], [1, -5, 1], [1, -1, -5], [1, -1, 5], [1, 1, -5], [1, 1, 5], [1, 5, -1], [1, 5, 1], [3, -3, -3], [3, -3, 3], [3, 3, -3], [3, 3, 3], [5, -1, -1], [5, -1, 1], [5, 1, -1], [5, 1, 1], [-5, -2, 0], [-5, 0, -2], [-5, 0, 2], [-5, 2, 0], [-4, -3, -2], [-4, -3, 2], [-4, -2, -3], [-4, -2, 3], [-4, 2, -3], [-4, 2, 3], [-4, 3, -2], [-4, 3, 2], [-3, -4, -2], [-3, -4, 2], [-3, -2, -4], [-3, -2, 4], [-3, 2, -4], [-3, 2, 4], [-3, 4, -2], [-3, 4, 2], [-2, -5, 0], [-2, -4, -3], [-2, -4, 3], [-2, -3, -4], [-2, -3, 4], [-2, 0, -5], [-2, 0, 5], [-2, 3, -4], [-2, 3, 4], [-2, 4, -3], [-2, 4, 3], [-2, 5, 0], [0, -5, -2], [0, -5, 2], [0, -2, -5], [0, -2, 5], [0, 2, -5], [0, 2, 5], [0, 5, -2], [0, 5, 2], [2, -5, 0], [2, -4, -3], [2, -4, 3], [2, -3, -4], [2, -3, 4], [2, 0, -5], [2, 0, 5], [2, 3, -4], [2, 3, 4], [2, 4, -3], [2, 4, 3], [2, 5, 0], [3, -4, -2], [3, -4, 2], [3, -2, -4], [3, -2, 4], [3, 2, -4], [3, 2, 4], [3, 4, -2], [3, 4, 2], [4, -3, -2], [4, -3, 2], [4, -2, -3], [4, -2, 3], [4, 2, -3], [4, 2, 3], [4, 3, -2], [4, 3, 2], [5, -2, 0], [5, 0, -2], [5, 0, 2], [5, 2, 0], [-5, -2, -1], [-5, -2, 1], [-5, -1, -2], [-5, -1, 2], [-5, 1, -2], [-5, 1, 2], [-5, 2, -1], [-5, 2, 1], [-2, -5, -1], [-2, -5, 1], [-2, -1, -5], [-2, -1, 5], [-2, 1, -5], [-2, 1, 5], [-2, 5, -1], [-2, 5, 1], [-1, -5, -2], [-1, -5, 2], [-1, -2, -5], [-1, -2, 5], [-1, 2, -5], [-1, 2, 5], [-1, 5, -2], [-1, 5, 2], [1, -5, -2], [1, -5, 2], [1, -2, -5], [1, -2, 5], [1, 2, -5], [1, 2, 5], [1, 5, -2], [1, 5, 2], [2, -5, -1], [2, -5, 1], [2, -1, -5], [2, -1, 5], [2, 1, -5], [2, 1, 5], [2, 5, -1], [2, 5, 1], [5, -2, -1], [5, -2, 1], [5, -1, -2], [5, -1, 2], [5, 1, -2], [5, 1, 2], [5, 2, -1], [5, 2, 1], [-4, -4, 0], [-4, 0, -4], [-4, 0, 4], [-4, 4, 0], [0, -4, -4], [0, -4, 4], [0, 4, -4], [0, 4, 4], [4, -4, 0], [4, 0, -4], [4, 0, 4], [4, 4, 0], [-5, -2, -2], [-5, -2, 2], [-5, 2, -2], [-5, 2, 2], [-4, -4, -1], [-4, -4, 1], [-4, -1, -4], [-4, -1, 4], [-4, 1, -4], [-4, 1, 4], [-4, 4, -1], [-4, 4, 1], [-2, -5, -2], [-2, -5, 2], [-2, -2, -5], [-2, -2, 5], [-2, 2, -5], [-2, 2, 5], [-2, 5, -2], [-2, 5, 2], [-1, -4, -4], [-1, -4, 4], [-1, 4, -4], [-1, 4, 4], [1, -4, -4], [1, -4, 4], [1, 4, -4], [1, 4, 4], [2, -5, -2], [2, -5, 2], [2, -2, -5], [2, -2, 5], [2, 2, -5], [2, 2, 5], [2, 5, -2], [2, 5, 2], [4, -4, -1], [4, -4, 1], [4, -1, -4], [4, -1, 4], [4, 1, -4], [4, 1, 4], [4, 4, -1], [4, 4, 1], [5, -2, -2], [5, -2, 2], [5, 2, -2], [5, 2, 2], [-5, -3, 0], [-5, 0, -3], [-5, 0, 3], [-5, 3, 0], [-4, -3, -3], [-4, -3, 3], [-4, 3, -3], [-4, 3, 3], [-3, -5, 0], [-3, -4, -3], [-3, -4, 3], [-3, -3, -4], [-3, -3, 4], [-3, 0, -5], [-3, 0, 5], [-3, 3, -4], [-3, 3, 4], [-3, 4, -3], [-3, 4, 3], [-3, 5, 0], [0, -5, -3], [0, -5, 3], [0, -3, -5], [0, -3, 5], [0, 3, -5], [0, 3, 5], [0, 5, -3], [0, 5, 3], [3, -5, 0], [3, -4, -3], [3, -4, 3], [3, -3, -4], [3, -3, 4], [3, 0, -5], [3, 0, 5], [3, 3, -4], [3, 3, 4], [3, 4, -3], [3, 4, 3], [3, 5, 0], [4, -3, -3], [4, -3, 3], [4, 3, -3], [4, 3, 3], [5, -3, 0], [5, 0, -3], [5, 0, 3], [5, 3, 0], [-5, -3, -1], [-5, -3, 1], [-5, -1, -3], [-5, -1, 3], [-5, 1, -3], [-5, 1, 3], [-5, 3, -1], [-5, 3, 1], [-3, -5, -1], [-3, -5, 1], [-3, -1, -5], [-3, -1, 5], [-3, 1, -5], [-3, 1, 5], [-3, 5, -1], [-3, 5, 1], [-1, -5, -3], [-1, -5, 3], [-1, -3, -5], [-1, -3, 5], [-1, 3, -5], [-1, 3, 5], [-1, 5, -3], [-1, 5, 3], [1, -5, -3], [1, -5, 3], [1, -3, -5], [1, -3, 5], [1, 3, -5], [1, 3, 5], [1, 5, -3], [1, 5, 3], [3, -5, -1], [3, -5, 1], [3, -1, -5], [3, -1, 5], [3, 1, -5], [3, 1, 5], [3, 5, -1], [3, 5, 1], [5, -3, -1], [5, -3, 1], [5, -1, -3], [5, -1, 3], [5, 1, -3], [5, 1, 3], [5, 3, -1], [5, 3, 1], [-6, 0, 0], [-4, -4, -2], [-4, -4, 2], [-4, -2, -4], [-4, -2, 4], [-4, 2, -4], [-4, 2, 4], [-4, 4, -2], [-4, 4, 2], [-2, -4, -4], [-2, -4, 4], [-2, 4, -4], [-2, 4, 4], [0, -6, 0], [0, 0, -6], [0, 0, 6], [0, 6, 0], [2, -4, -4], [2, -4, 4], [2, 4, -4], [2, 4, 4], [4, -4, -2], [4, -4, 2], [4, -2, -4], [4, -2, 4], [4, 2, -4], [4, 2, 4], [4, 4, -2], [4, 4, 2], [6, 0, 0], [-6, -1, 0], [-6, 0, -1], [-6, 0, 1], [-6, 1, 0], [-1, -6, 0], [-1, 0, -6], [-1, 0, 6], [-1, 6, 0], [0, -6, -1], [0, -6, 1], [0, -1, -6], [0, -1, 6], [0, 1, -6], [0, 1, 6], [0, 6, -1], [0, 6, 1], [1, -6, 0], [1, 0, -6], [1, 0, 6], [1, 6, 0], [6, -1, 0], [6, 0, -1], [6, 0, 1], [6, 1, 0], [-6, -1, -1], [-6, -1, 1], [-6, 1, -1], [-6, 1, 1], [-5, -3, -2], [-5, -3, 2], [-5, -2, -3], [-5, -2, 3], [-5, 2, -3], [-5, 2, 3], [-5, 3, -2], [-5, 3, 2], [-3, -5, -2], [-3, -5, 2], [-3, -2, -5], [-3, -2, 5], [-3, 2, -5], [-3, 2, 5], [-3, 5, -2], [-3, 5, 2], [-2, -5, -3], [-2, -5, 3], [-2, -3, -5], [-2, -3, 5], [-2, 3, -5], [-2, 3, 5], [-2, 5, -3], [-2, 5, 3], [-1, -6, -1], [-1, -6, 1], [-1, -1, -6], [-1, -1, 6], [-1, 1, -6], [-1, 1, 6], [-1, 6, -1], [-1, 6, 1], [1, -6, -1], [1, -6, 1], [1, -1, -6], [1, -1, 6], [1, 1, -6], [1, 1, 6], [1, 6, -1], [1, 6, 1], [2, -5, -3], [2, -5, 3], [2, -3, -5], [2, -3, 5], [2, 3, -5], [2, 3, 5], [2, 5, -3], [2, 5, 3], [3, -5, -2], [3, -5, 2], [3, -2, -5], [3, -2, 5], [3, 2, -5], [3, 2, 5], [3, 5, -2], [3, 5, 2], [5, -3, -2], [5, -3, 2], [5, -2, -3], [5, -2, 3], [5, 2, -3], [5, 2, 3], [5, 3, -2], [5, 3, 2], [6, -1, -1], [6, -1, 1], [6, 1, -1], [6, 1, 1], [-6, -2, 0], [-6, 0, -2], [-6, 0, 2], [-6, 2, 0], [-2, -6, 0], [-2, 0, -6], [-2, 0, 6], [-2, 6, 0], [0, -6, -2], [0, -6, 2], [0, -2, -6], [0, -2, 6], [0, 2, -6], [0, 2, 6], [0, 6, -2], [0, 6, 2], [2, -6, 0], [2, 0, -6], [2, 0, 6], [2, 6, 0], [6, -2, 0], [6, 0, -2], [6, 0, 2], [6, 2, 0], [-6, -2, -1], [-6, -2, 1], [-6, -1, -2], [-6, -1, 2], [-6, 1, -2], [-6, 1, 2], [-6, 2, -1], [-6, 2, 1], [-5, -4, 0], [-5, 0, -4], [-5, 0, 4], [-5, 4, 0], [-4, -5, 0], [-4, -4, -3], [-4, -4, 3], [-4, -3, -4], [-4, -3, 4], [-4, 0, -5], [-4, 0, 5], [-4, 3, -4], [-4, 3, 4], [-4, 4, -3], [-4, 4, 3], [-4, 5, 0], [-3, -4, -4], [-3, -4, 4], [-3, 4, -4], [-3, 4, 4], [-2, -6, -1], [-2, -6, 1], [-2, -1, -6], [-2, -1, 6], [-2, 1, -6], [-2, 1, 6], [-2, 6, -1], [-2, 6, 1], [-1, -6, -2], [-1, -6, 2], [-1, -2, -6], [-1, -2, 6], [-1, 2, -6], [-1, 2, 6], [-1, 6, -2], [-1, 6, 2], [0, -5, -4], [0, -5, 4], [0, -4, -5], [0, -4, 5], [0, 4, -5], [0, 4, 5], [0, 5, -4], [0, 5, 4], [1, -6, -2], [1, -6, 2], [1, -2, -6], [1, -2, 6], [1, 2, -6], [1, 2, 6], [1, 6, -2], [1, 6, 2], [2, -6, -1], [2, -6, 1], [2, -1, -6], [2, -1, 6], [2, 1, -6], [2, 1, 6], [2, 6, -1], [2, 6, 1], [3, -4, -4], [3, -4, 4], [3, 4, -4], [3, 4, 4], [4, -5, 0], [4, -4, -3], [4, -4, 3], [4, -3, -4], [4, -3, 4], [4, 0, -5], [4, 0, 5], [4, 3, -4], [4, 3, 4], [4, 4, -3], [4, 4, 3], [4, 5, 0], [5, -4, 0], [5, 0, -4], [5, 0, 4], [5, 4, 0], [6, -2, -1], [6, -2, 1], [6, -1, -2], [6, -1, 2], [6, 1, -2], [6, 1, 2], [6, 2, -1], [6, 2, 1], [-5, -4, -1], [-5, -4, 1], [-5, -1, -4], [-5, -1, 4], [-5, 1, -4], [-5, 1, 4], [-5, 4, -1], [-5, 4, 1], [-4, -5, -1], [-4, -5, 1], [-4, -1, -5], [-4, -1, 5], [-4, 1, -5], [-4, 1, 5], [-4, 5, -1], [-4, 5, 1], [-1, -5, -4], [-1, -5, 4], [-1, -4, -5], [-1, -4, 5], [-1, 4, -5], [-1, 4, 5], [-1, 5, -4], [-1, 5, 4], [1, -5, -4], [1, -5, 4], [1, -4, -5], [1, -4, 5], [1, 4, -5], [1, 4, 5], [1, 5, -4], [1, 5, 4], [4, -5, -1], [4, -5, 1], [4, -1, -5], [4, -1, 5], [4, 1, -5], [4, 1, 5], [4, 5, -1], [4, 5, 1], [5, -4, -1], [5, -4, 1], [5, -1, -4], [5, -1, 4], [5, 1, -4], [5, 1, 4], [5, 4, -1], [5, 4, 1], [-5, -3, -3], [-5, -3, 3], [-5, 3, -3], [-5, 3, 3], [-3, -5, -3], [-3, -5, 3], [-3, -3, -5], [-3, -3, 5], [-3, 3, -5], [-3, 3, 5], [-3, 5, -3], [-3, 5, 3], [3, -5, -3], [3, -5, 3], [3, -3, -5], [3, -3, 5], [3, 3, -5], [3, 3, 5], [3, 5, -3], [3, 5, 3], [5, -3, -3], [5, -3, 3], [5, 3, -3], [5, 3, 3], [-6, -2, -2], [-6, -2, 2], [-6, 2, -2], [-6, 2, 2], [-2, -6, -2], [-2, -6, 2], [-2, -2, -6], [-2, -2, 6], [-2, 2, -6], [-2, 2, 6], [-2, 6, -2], [-2, 6, 2], [2, -6, -2], [2, -6, 2], [2, -2, -6], [2, -2, 6], [2, 2, -6], [2, 2, 6], [2, 6, -2], [2, 6, 2], [6, -2, -2], [6, -2, 2], [6, 2, -2], [6, 2, 2], [-6, -3, 0], [-6, 0, -3], [-6, 0, 3], [-6, 3, 0], [-5, -4, -2], [-5, -4, 2], [-5, -2, -4], [-5, -2, 4], [-5, 2, -4], [-5, 2, 4], [-5, 4, -2], [-5, 4, 2], [-4, -5, -2], [-4, -5, 2], [-4, -2, -5], [-4, -2, 5], [-4, 2, -5], [-4, 2, 5], [-4, 5, -2], [-4, 5, 2], [-3, -6, 0], [-3, 0, -6], [-3, 0, 6], [-3, 6, 0], [-2, -5, -4], [-2, -5, 4], [-2, -4, -5], [-2, -4, 5], [-2, 4, -5], [-2, 4, 5], [-2, 5, -4], [-2, 5, 4], [0, -6, -3], [0, -6, 3], [0, -3, -6], [0, -3, 6], [0, 3, -6], [0, 3, 6], [0, 6, -3], [0, 6, 3], [2, -5, -4], [2, -5, 4], [2, -4, -5], [2, -4, 5], [2, 4, -5], [2, 4, 5], [2, 5, -4], [2, 5, 4], [3, -6, 0], [3, 0, -6], [3, 0, 6], [3, 6, 0], [4, -5, -2], [4, -5, 2], [4, -2, -5], [4, -2, 5], [4, 2, -5], [4, 2, 5], [4, 5, -2], [4, 5, 2], [5, -4, -2], [5, -4, 2], [5, -2, -4], [5, -2, 4], [5, 2, -4], [5, 2, 4], [5, 4, -2], [5, 4, 2], [6, -3, 0], [6, 0, -3], [6, 0, 3], [6, 3, 0], [-6, -3, -1], [-6, -3, 1], [-6, -1, -3], [-6, -1, 3], [-6, 1, -3], [-6, 1, 3], [-6, 3, -1], [-6, 3, 1], [-3, -6, -1], [-3, -6, 1], [-3, -1, -6], [-3, -1, 6], [-3, 1, -6], [-3, 1, 6], [-3, 6, -1], [-3, 6, 1], [-1, -6, -3], [-1, -6, 3], [-1, -3, -6], [-1, -3, 6], [-1, 3, -6], [-1, 3, 6], [-1, 6, -3], [-1, 6, 3], [1, -6, -3], [1, -6, 3], [1, -3, -6], [1, -3, 6], [1, 3, -6], [1, 3, 6], [1, 6, -3], [1, 6, 3], [3, -6, -1], [3, -6, 1], [3, -1, -6], [3, -1, 6], [3, 1, -6], [3, 1, 6], [3, 6, -1], [3, 6, 1], [6, -3, -1], [6, -3, 1], [6, -1, -3], [6, -1, 3], [6, 1, -3], [6, 1, 3], [6, 3, -1], [6, 3, 1], [-4, -4, -4], [-4, -4, 4], [-4, 4, -4], [-4, 4, 4], [4, -4, -4], [4, -4, 4], [4, 4, -4], [4, 4, 4], [-7, 0, 0], [-6, -3, -2], [-6, -3, 2], [-6, -2, -3], [-6, -2, 3], [-6, 2, -3], [-6, 2, 3], [-6, 3, -2], [-6, 3, 2], [-3, -6, -2], [-3, -6, 2], [-3, -2, -6], [-3, -2, 6], [-3, 2, -6], [-3, 2, 6], [-3, 6, -2], [-3, 6, 2], [-2, -6, -3], [-2, -6, 3], [-2, -3, -6], [-2, -3, 6], [-2, 3, -6], [-2, 3, 6], [-2, 6, -3], [-2, 6, 3], [0, -7, 0], [0, 0, -7], [0, 0, 7], [0, 7, 0], [2, -6, -3], [2, -6, 3], [2, -3, -6], [2, -3, 6], [2, 3, -6], [2, 3, 6], [2, 6, -3], [2, 6, 3], [3, -6, -2], [3, -6, 2], [3, -2, -6], [3, -2, 6], [3, 2, -6], [3, 2, 6], [3, 6, -2], [3, 6, 2], [6, -3, -2], [6, -3, 2], [6, -2, -3], [6, -2, 3], [6, 2, -3], [6, 2, 3], [6, 3, -2], [6, 3, 2], [7, 0, 0], [-7, -1, 0], [-7, 0, -1], [-7, 0, 1], [-7, 1, 0], [-5, -5, 0], [-5, -4, -3], [-5, -4, 3], [-5, -3, -4], [-5, -3, 4], [-5, 0, -5], [-5, 0, 5], [-5, 3, -4], [-5, 3, 4], [-5, 4, -3], [-5, 4, 3], [-5, 5, 0], [-4, -5, -3], [-4, -5, 3], [-4, -3, -5], [-4, -3, 5], [-4, 3, -5], [-4, 3, 5], [-4, 5, -3], [-4, 5, 3], [-3, -5, -4], [-3, -5, 4], [-3, -4, -5], [-3, -4, 5], [-3, 4, -5], [-3, 4, 5], [-3, 5, -4], [-3, 5, 4], [-1, -7, 0], [-1, 0, -7], [-1, 0, 7], [-1, 7, 0], [0, -7, -1], [0, -7, 1], [0, -5, -5], [0, -5, 5], [0, -1, -7], [0, -1, 7], [0, 1, -7], [0, 1, 7], [0, 5, -5], [0, 5, 5], [0, 7, -1], [0, 7, 1], [1, -7, 0], [1, 0, -7], [1, 0, 7], [1, 7, 0], [3, -5, -4], [3, -5, 4], [3, -4, -5], [3, -4, 5], [3, 4, -5], [3, 4, 5], [3, 5, -4], [3, 5, 4], [4, -5, -3], [4, -5, 3], [4, -3, -5], [4, -3, 5], [4, 3, -5], [4, 3, 5], [4, 5, -3], [4, 5, 3], [5, -5, 0], [5, -4, -3], [5, -4, 3], [5, -3, -4], [5, -3, 4], [5, 0, -5], [5, 0, 5], [5, 3, -4], [5, 3, 4], [5, 4, -3], [5, 4, 3], [5, 5, 0], [7, -1, 0], [7, 0, -1], [7, 0, 1], [7, 1, 0], [-7, -1, -1], [-7, -1, 1], [-7, 1, -1], [-7, 1, 1], [-5, -5, -1], [-5, -5, 1], [-5, -1, -5], [-5, -1, 5], [-5, 1, -5], [-5, 1, 5], [-5, 5, -1], [-5, 5, 1], [-1, -7, -1], [-1, -7, 1], [-1, -5, -5], [-1, -5, 5], [-1, -1, -7], [-1, -1, 7], [-1, 1, -7], [-1, 1, 7], [-1, 5, -5], [-1, 5, 5], [-1, 7, -1], [-1, 7, 1], [1, -7, -1], [1, -7, 1], [1, -5, -5], [1, -5, 5], [1, -1, -7], [1, -1, 7], [1, 1, -7], [1, 1, 7], [1, 5, -5], [1, 5, 5], [1, 7, -1], [1, 7, 1], [5, -5, -1], [5, -5, 1], [5, -1, -5], [5, -1, 5], [5, 1, -5], [5, 1, 5], [5, 5, -1], [5, 5, 1], [7, -1, -1], [7, -1, 1], [7, 1, -1], [7, 1, 1], [-6, -4, 0], [-6, 0, -4], [-6, 0, 4], [-6, 4, 0], [-4, -6, 0], [-4, 0, -6], [-4, 0, 6], [-4, 6, 0], [0, -6, -4], [0, -6, 4], [0, -4, -6], [0, -4, 6], [0, 4, -6], [0, 4, 6], [0, 6, -4], [0, 6, 4], [4, -6, 0], [4, 0, -6], [4, 0, 6], [4, 6, 0], [6, -4, 0], [6, 0, -4], [6, 0, 4], [6, 4, 0], [-7, -2, 0], [-7, 0, -2], [-7, 0, 2], [-7, 2, 0], [-6, -4, -1], [-6, -4, 1], [-6, -1, -4], [-6, -1, 4], [-6, 1, -4], [-6, 1, 4], [-6, 4, -1], [-6, 4, 1], [-4, -6, -1], [-4, -6, 1], [-4, -1, -6], [-4, -1, 6], [-4, 1, -6], [-4, 1, 6], [-4, 6, -1], [-4, 6, 1], [-2, -7, 0], [-2, 0, -7], [-2, 0, 7], [-2, 7, 0], [-1, -6, -4], [-1, -6, 4], [-1, -4, -6], [-1, -4, 6], [-1, 4, -6], [-1, 4, 6], [-1, 6, -4], [-1, 6, 4], [0, -7, -2], [0, -7, 2], [0, -2, -7], [0, -2, 7], [0, 2, -7], [0, 2, 7], [0, 7, -2], [0, 7, 2], [1, -6, -4], [1, -6, 4], [1, -4, -6], [1, -4, 6], [1, 4, -6], [1, 4, 6], [1, 6, -4], [1, 6, 4], [2, -7, 0], [2, 0, -7], [2, 0, 7], [2, 7, 0], [4, -6, -1], [4, -6, 1], [4, -1, -6], [4, -1, 6], [4, 1, -6], [4, 1, 6], [4, 6, -1], [4, 6, 1], [6, -4, -1], [6, -4, 1], [6, -1, -4], [6, -1, 4], [6, 1, -4], [6, 1, 4], [6, 4, -1], [6, 4, 1], [7, -2, 0], [7, 0, -2], [7, 0, 2], [7, 2, 0], [-7, -2, -1], [-7, -2, 1], [-7, -1, -2], [-7, -1, 2], [-7, 1, -2], [-7, 1, 2], [-7, 2, -1], [-7, 2, 1], [-6, -3, -3], [-6, -3, 3], [-6, 3, -3], [-6, 3, 3], [-5, -5, -2], [-5, -5, 2], [-5, -2, -5], [-5, -2, 5], [-5, 2, -5], [-5, 2, 5], [-5, 5, -2], [-5, 5, 2], [-3, -6, -3], [-3, -6, 3], [-3, -3, -6], [-3, -3, 6], [-3, 3, -6], [-3, 3, 6], [-3, 6, -3], [-3, 6, 3], [-2, -7, -1], [-2, -7, 1], [-2, -5, -5], [-2, -5, 5], [-2, -1, -7], [-2, -1, 7], [-2, 1, -7], [-2, 1, 7], [-2, 5, -5], [-2, 5, 5], [-2, 7, -1], [-2, 7, 1], [-1, -7, -2], [-1, -7, 2], [-1, -2, -7], [-1, -2, 7], [-1, 2, -7], [-1, 2, 7], [-1, 7, -2], [-1, 7, 2], [1, -7, -2], [1, -7, 2], [1, -2, -7], [1, -2, 7], [1, 2, -7], [1, 2, 7], [1, 7, -2], [1, 7, 2], [2, -7, -1], [2, -7, 1], [2, -5, -5], [2, -5, 5], [2, -1, -7], [2, -1, 7], [2, 1, -7], [2, 1, 7], [2, 5, -5], [2, 5, 5], [2, 7, -1], [2, 7, 1], [3, -6, -3], [3, -6, 3], [3, -3, -6], [3, -3, 6], [3, 3, -6], [3, 3, 6], [3, 6, -3], [3, 6, 3], [5, -5, -2], [5, -5, 2], [5, -2, -5], [5, -2, 5], [5, 2, -5], [5, 2, 5], [5, 5, -2], [5, 5, 2], [6, -3, -3], [6, -3, 3], [6, 3, -3], [6, 3, 3], [7, -2, -1], [7, -2, 1], [7, -1, -2], [7, -1, 2], [7, 1, -2], [7, 1, 2], [7, 2, -1], [7, 2, 1], [-6, -4, -2], [-6, -4, 2], [-6, -2, -4], [-6, -2, 4], [-6, 2, -4], [-6, 2, 4], [-6, 4, -2], [-6, 4, 2], [-4, -6, -2], [-4, -6, 2], [-4, -2, -6], [-4, -2, 6], [-4, 2, -6], [-4, 2, 6], [-4, 6, -2], [-4, 6, 2], [-2, -6, -4], [-2, -6, 4], [-2, -4, -6], [-2, -4, 6], [-2, 4, -6], [-2, 4, 6], [-2, 6, -4], [-2, 6, 4], [2, -6, -4], [2, -6, 4], [2, -4, -6], [2, -4, 6], [2, 4, -6], [2, 4, 6], [2, 6, -4], [2, 6, 4], [4, -6, -2], [4, -6, 2], [4, -2, -6], [4, -2, 6], [4, 2, -6], [4, 2, 6], [4, 6, -2], [4, 6, 2], [6, -4, -2], [6, -4, 2], [6, -2, -4], [6, -2, 4], [6, 2, -4], [6, 2, 4], [6, 4, -2], [6, 4, 2], [-7, -2, -2], [-7, -2, 2], [-7, 2, -2], [-7, 2, 2], [-5, -4, -4], [-5, -4, 4], [-5, 4, -4], [-5, 4, 4], [-4, -5, -4], [-4, -5, 4], [-4, -4, -5], [-4, -4, 5], [-4, 4, -5], [-4, 4, 5], [-4, 5, -4], [-4, 5, 4], [-2, -7, -2], [-2, -7, 2], [-2, -2, -7], [-2, -2, 7], [-2, 2, -7], [-2, 2, 7], [-2, 7, -2], [-2, 7, 2], [2, -7, -2], [2, -7, 2], [2, -2, -7], [2, -2, 7], [2, 2, -7], [2, 2, 7], [2, 7, -2], [2, 7, 2], [4, -5, -4], [4, -5, 4], [4, -4, -5], [4, -4, 5], [4, 4, -5], [4, 4, 5], [4, 5, -4], [4, 5, 4], [5, -4, -4], [5, -4, 4], [5, 4, -4], [5, 4, 4], [7, -2, -2], [7, -2, 2], [7, 2, -2], [7, 2, 2], [-7, -3, 0], [-7, 0, -3], [-7, 0, 3], [-7, 3, 0], [-3, -7, 0], [-3, 0, -7], [-3, 0, 7], [-3, 7, 0], [0, -7, -3], [0, -7, 3], [0, -3, -7], [0, -3, 7], [0, 3, -7], [0, 3, 7], [0, 7, -3], [0, 7, 3], [3, -7, 0], [3, 0, -7], [3, 0, 7], [3, 7, 0], [7, -3, 0], [7, 0, -3], [7, 0, 3], [7, 3, 0], [-7, -3, -1], [-7, -3, 1], [-7, -1, -3], [-7, -1, 3], [-7, 1, -3], [-7, 1, 3], [-7, 3, -1], [-7, 3, 1], [-5, -5, -3], [-5, -5, 3], [-5, -3, -5], [-5, -3, 5], [-5, 3, -5], [-5, 3, 5], [-5, 5, -3], [-5, 5, 3], [-3, -7, -1], [-3, -7, 1], [-3, -5, -5], [-3, -5, 5], [-3, -1, -7], [-3, -1, 7], [-3, 1, -7], [-3, 1, 7], [-3, 5, -5], [-3, 5, 5], [-3, 7, -1], [-3, 7, 1], [-1, -7, -3], [-1, -7, 3], [-1, -3, -7], [-1, -3, 7], [-1, 3, -7], [-1, 3, 7], [-1, 7, -3], [-1, 7, 3], [1, -7, -3], [1, -7, 3], [1, -3, -7], [1, -3, 7], [1, 3, -7], [1, 3, 7], [1, 7, -3], [1, 7, 3], [3, -7, -1], [3, -7, 1], [3, -5, -5], [3, -5, 5], [3, -1, -7], [3, -1, 7], [3, 1, -7], [3, 1, 7], [3, 5, -5], [3, 5, 5], [3, 7, -1], [3, 7, 1], [5, -5, -3], [5, -5, 3], [5, -3, -5], [5, -3, 5], [5, 3, -5], [5, 3, 5], [5, 5, -3], [5, 5, 3], [7, -3, -1], [7, -3, 1], [7, -1, -3], [7, -1, 3], [7, 1, -3], [7, 1, 3], [7, 3, -1], [7, 3, 1], [-6, -5, 0], [-6, -4, -3], [-6, -4, 3], [-6, -3, -4], [-6, -3, 4], [-6, 0, -5], [-6, 0, 5], [-6, 3, -4], [-6, 3, 4], [-6, 4, -3], [-6, 4, 3], [-6, 5, 0], [-5, -6, 0], [-5, 0, -6], [-5, 0, 6], [-5, 6, 0], [-4, -6, -3], [-4, -6, 3], [-4, -3, -6], [-4, -3, 6], [-4, 3, -6], [-4, 3, 6], [-4, 6, -3], [-4, 6, 3], [-3, -6, -4], [-3, -6, 4], [-3, -4, -6], [-3, -4, 6], [-3, 4, -6], [-3, 4, 6], [-3, 6, -4], [-3, 6, 4], [0, -6, -5], [0, -6, 5], [0, -5, -6], [0, -5, 6], [0, 5, -6], [0, 5, 6], [0, 6, -5], [0, 6, 5], [3, -6, -4], [3, -6, 4], [3, -4, -6], [3, -4, 6], [3, 4, -6], [3, 4, 6], [3, 6, -4], [3, 6, 4], [4, -6, -3], [4, -6, 3], [4, -3, -6], [4, -3, 6], [4, 3, -6], [4, 3, 6], [4, 6, -3], [4, 6, 3], [5, -6, 0], [5, 0, -6], [5, 0, 6], [5, 6, 0], [6, -5, 0], [6, -4, -3], [6, -4, 3], [6, -3, -4], [6, -3, 4], [6, 0, -5], [6, 0, 5], [6, 3, -4], [6, 3, 4], [6, 4, -3], [6, 4, 3], [6, 5, 0], [-7, -3, -2], [-7, -3, 2], [-7, -2, -3], [-7, -2, 3], [-7, 2, -3], [-7, 2, 3], [-7, 3, -2], [-7, 3, 2], [-6, -5, -1], [-6, -5, 1], [-6, -1, -5], [-6, -1, 5], [-6, 1, -5], [-6, 1, 5], [-6, 5, -1], [-6, 5, 1], [-5, -6, -1], [-5, -6, 1], [-5, -1, -6], [-5, -1, 6], [-5, 1, -6], [-5, 1, 6], [-5, 6, -1], [-5, 6, 1], [-3, -7, -2], [-3, -7, 2], [-3, -2, -7], [-3, -2, 7], [-3, 2, -7], [-3, 2, 7], [-3, 7, -2], [-3, 7, 2], [-2, -7, -3], [-2, -7, 3], [-2, -3, -7], [-2, -3, 7], [-2, 3, -7], [-2, 3, 7], [-2, 7, -3], [-2, 7, 3], [-1, -6, -5], [-1, -6, 5], [-1, -5, -6], [-1, -5, 6], [-1, 5, -6], [-1, 5, 6], [-1, 6, -5], [-1, 6, 5], [1, -6, -5], [1, -6, 5], [1, -5, -6], [1, -5, 6], [1, 5, -6], [1, 5, 6], [1, 6, -5], [1, 6, 5], [2, -7, -3], [2, -7, 3], [2, -3, -7], [2, -3, 7], [2, 3, -7], [2, 3, 7], [2, 7, -3], [2, 7, 3], [3, -7, -2], [3, -7, 2], [3, -2, -7], [3, -2, 7], [3, 2, -7], [3, 2, 7], [3, 7, -2], [3, 7, 2], [5, -6, -1], [5, -6, 1], [5, -1, -6], [5, -1, 6], [5, 1, -6], [5, 1, 6], [5, 6, -1], [5, 6, 1], [6, -5, -1], [6, -5, 1], [6, -1, -5], [6, -1, 5], [6, 1, -5], [6, 1, 5], [6, 5, -1], [6, 5, 1], [7, -3, -2], [7, -3, 2], [7, -2, -3], [7, -2, 3], [7, 2, -3], [7, 2, 3], [7, 3, -2], [7, 3, 2], [-8, 0, 0], [0, -8, 0], [0, 0, -8], [0, 0, 8], [0, 8, 0], [8, 0, 0], [-8, -1, 0], [-8, 0, -1], [-8, 0, 1], [-8, 1, 0], [-7, -4, 0], [-7, 0, -4], [-7, 0, 4], [-7, 4, 0], [-6, -5, -2], [-6, -5, 2], [-6, -2, -5], [-6, -2, 5], [-6, 2, -5], [-6, 2, 5], [-6, 5, -2], [-6, 5, 2], [-5, -6, -2], [-5, -6, 2], [-5, -2, -6], [-5, -2, 6], [-5, 2, -6], [-5, 2, 6], [-5, 6, -2], [-5, 6, 2], [-4, -7, 0], [-4, 0, -7], [-4, 0, 7], [-4, 7, 0], [-2, -6, -5], [-2, -6, 5], [-2, -5, -6], [-2, -5, 6], [-2, 5, -6], [-2, 5, 6], [-2, 6, -5], [-2, 6, 5], [-1, -8, 0], [-1, 0, -8], [-1, 0, 8], [-1, 8, 0], [0, -8, -1], [0, -8, 1], [0, -7, -4], [0, -7, 4], [0, -4, -7], [0, -4, 7], [0, -1, -8], [0, -1, 8], [0, 1, -8], [0, 1, 8], [0, 4, -7], [0, 4, 7], [0, 7, -4], [0, 7, 4], [0, 8, -1], [0, 8, 1], [1, -8, 0], [1, 0, -8], [1, 0, 8], [1, 8, 0], [2, -6, -5], [2, -6, 5], [2, -5, -6], [2, -5, 6], [2, 5, -6], [2, 5, 6], [2, 6, -5], [2, 6, 5], [4, -7, 0], [4, 0, -7], [4, 0, 7], [4, 7, 0], [5, -6, -2], [5, -6, 2], [5, -2, -6], [5, -2, 6], [5, 2, -6], [5, 2, 6], [5, 6, -2], [5, 6, 2], [6, -5, -2], [6, -5, 2], [6, -2, -5], [6, -2, 5], [6, 2, -5], [6, 2, 5], [6, 5, -2], [6, 5, 2], [7, -4, 0], [7, 0, -4], [7, 0, 4], [7, 4, 0], [8, -1, 0], [8, 0, -1], [8, 0, 1], [8, 1, 0], [-8, -1, -1], [-8, -1, 1], [-8, 1, -1], [-8, 1, 1], [-7, -4, -1], [-7, -4, 1], [-7, -1, -4], [-7, -1, 4], [-7, 1, -4], [-7, 1, 4], [-7, 4, -1], [-7, 4, 1], [-5, -5, -4], [-5, -5, 4], [-5, -4, -5], [-5, -4, 5], [-5, 4, -5], [-5, 4, 5], [-5, 5, -4], [-5, 5, 4], [-4, -7, -1], [-4, -7, 1], [-4, -5, -5], [-4, -5, 5], [-4, -1, -7], [-4, -1, 7], [-4, 1, -7], [-4, 1, 7], [-4, 5, -5], [-4, 5, 5], [-4, 7, -1], [-4, 7, 1], [-1, -8, -1], [-1, -8, 1], [-1, -7, -4], [-1, -7, 4], [-1, -4, -7], [-1, -4, 7], [-1, -1, -8], [-1, -1, 8], [-1, 1, -8], [-1, 1, 8], [-1, 4, -7], [-1, 4, 7], [-1, 7, -4], [-1, 7, 4], [-1, 8, -1], [-1, 8, 1], [1, -8, -1], [1, -8, 1], [1, -7, -4], [1, -7, 4], [1, -4, -7], [1, -4, 7], [1, -1, -8], [1, -1, 8], [1, 1, -8], [1, 1, 8], [1, 4, -7], [1, 4, 7], [1, 7, -4], [1, 7, 4], [1, 8, -1], [1, 8, 1], [4, -7, -1], [4, -7, 1], [4, -5, -5], [4, -5, 5], [4, -1, -7], [4, -1, 7], [4, 1, -7], [4, 1, 7], [4, 5, -5], [4, 5, 5], [4, 7, -1], [4, 7, 1], [5, -5, -4], [5, -5, 4], [5, -4, -5], [5, -4, 5], [5, 4, -5], [5, 4, 5], [5, 5, -4], [5, 5, 4], [7, -4, -1], [7, -4, 1], [7, -1, -4], [7, -1, 4], [7, 1, -4], [7, 1, 4], [7, 4, -1], [7, 4, 1], [8, -1, -1], [8, -1, 1], [8, 1, -1], [8, 1, 1], [-7, -3, -3], [-7, -3, 3], [-7, 3, -3], [-7, 3, 3], [-3, -7, -3], [-3, -7, 3], [-3, -3, -7], [-3, -3, 7], [-3, 3, -7], [-3, 3, 7], [-3, 7, -3], [-3, 7, 3], [3, -7, -3], [3, -7, 3], [3, -3, -7], [3, -3, 7], [3, 3, -7], [3, 3, 7], [3, 7, -3], [3, 7, 3], [7, -3, -3], [7, -3, 3], [7, 3, -3], [7, 3, 3], [-8, -2, 0], [-8, 0, -2], [-8, 0, 2], [-8, 2, 0], [-6, -4, -4], [-6, -4, 4], [-6, 4, -4], [-6, 4, 4], [-4, -6, -4], [-4, -6, 4], [-4, -4, -6], [-4, -4, 6], [-4, 4, -6], [-4, 4, 6], [-4, 6, -4], [-4, 6, 4], [-2, -8, 0], [-2, 0, -8], [-2, 0, 8], [-2, 8, 0], [0, -8, -2], [0, -8, 2], [0, -2, -8], [0, -2, 8], [0, 2, -8], [0, 2, 8], [0, 8, -2], [0, 8, 2], [2, -8, 0], [2, 0, -8], [2, 0, 8], [2, 8, 0], [4, -6, -4], [4, -6, 4], [4, -4, -6], [4, -4, 6], [4, 4, -6], [4, 4, 6], [4, 6, -4], [4, 6, 4], [6, -4, -4], [6, -4, 4], [6, 4, -4], [6, 4, 4], [8, -2, 0], [8, 0, -2], [8, 0, 2], [8, 2, 0], [-8, -2, -1], [-8, -2, 1], [-8, -1, -2], [-8, -1, 2], [-8, 1, -2], [-8, 1, 2], [-8, 2, -1], [-8, 2, 1], [-7, -4, -2], [-7, -4, 2], [-7, -2, -4], [-7, -2, 4], [-7, 2, -4], [-7, 2, 4], [-7, 4, -2], [-7, 4, 2], [-4, -7, -2], [-4, -7, 2], [-4, -2, -7], [-4, -2, 7], [-4, 2, -7], [-4, 2, 7], [-4, 7, -2], [-4, 7, 2], [-2, -8, -1], [-2, -8, 1], [-2, -7, -4], [-2, -7, 4], [-2, -4, -7], [-2, -4, 7], [-2, -1, -8], [-2, -1, 8], [-2, 1, -8], [-2, 1, 8], [-2, 4, -7], [-2, 4, 7], [-2, 7, -4], [-2, 7, 4], [-2, 8, -1], [-2, 8, 1], [-1, -8, -2], [-1, -8, 2], [-1, -2, -8], [-1, -2, 8], [-1, 2, -8], [-1, 2, 8], [-1, 8, -2], [-1, 8, 2], [1, -8, -2], [1, -8, 2], [1, -2, -8], [1, -2, 8], [1, 2, -8], [1, 2, 8], [1, 8, -2], [1, 8, 2], [2, -8, -1], [2, -8, 1], [2, -7, -4], [2, -7, 4], [2, -4, -7], [2, -4, 7], [2, -1, -8], [2, -1, 8], [2, 1, -8], [2, 1, 8], [2, 4, -7], [2, 4, 7], [2, 7, -4], [2, 7, 4], [2, 8, -1], [2, 8, 1], [4, -7, -2], [4, -7, 2], [4, -2, -7], [4, -2, 7], [4, 2, -7], [4, 2, 7], [4, 7, -2], [4, 7, 2], [7, -4, -2], [7, -4, 2], [7, -2, -4], [7, -2, 4], [7, 2, -4], [7, 2, 4], [7, 4, -2], [7, 4, 2], [8, -2, -1], [8, -2, 1], [8, -1, -2], [8, -1, 2], [8, 1, -2], [8, 1, 2], [8, 2, -1], [8, 2, 1], [-6, -5, -3], [-6, -5, 3], [-6, -3, -5], [-6, -3, 5], [-6, 3, -5], [-6, 3, 5], [-6, 5, -3], [-6, 5, 3], [-5, -6, -3], [-5, -6, 3], [-5, -3, -6], [-5, -3, 6], [-5, 3, -6], [-5, 3, 6], [-5, 6, -3], [-5, 6, 3], [-3, -6, -5], [-3, -6, 5], [-3, -5, -6], [-3, -5, 6], [-3, 5, -6], [-3, 5, 6], [-3, 6, -5], [-3, 6, 5], [3, -6, -5], [3, -6, 5], [3, -5, -6], [3, -5, 6], [3, 5, -6], [3, 5, 6], [3, 6, -5], [3, 6, 5], [5, -6, -3], [5, -6, 3], [5, -3, -6], [5, -3, 6], [5, 3, -6], [5, 3, 6], [5, 6, -3], [5, 6, 3], [6, -5, -3], [6, -5, 3], [6, -3, -5], [6, -3, 5], [6, 3, -5], [6, 3, 5], [6, 5, -3], [6, 5, 3]]
