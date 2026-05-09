import prisma from "../prisma/client.js"

const queue = []
let flushing = false

export const enqueueLocation = (data) => {
  queue.push(data)
}

// flush every 2 seconds
setInterval(async () => {
  if (queue.length === 0 || flushing) return
  flushing = true

  const batch = queue.splice(0, queue.length)
  try {
    await prisma.vehicleLocation.createMany({ data: batch })
    console.log(`Flushed ${batch.length} location(s) to DB`)
  } catch (err) {
    // put failed items back in the queue to retry next flush
    queue.unshift(...batch)
    console.error("Batch location insert failed", err)
  } finally {
    flushing = false
  }
}, 2000)
