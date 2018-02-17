import * as geometrics from "geometrics"
import Pool from "Pool"

const pool: Pool<Uint16Array> = new Pool(() => { return new Uint16Array(geometrics.CHUNK_SIZE_CUBED * geometrics.facesPerCube) })

export default pool
