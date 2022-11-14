const Response = require('../common/Response')
const Dynamo = require('../common/Dynamo')
const tableName = process.env.tableName

exports.handler = async event => {
	console.log('event', event)
	
	const inventory = JSON.parse(event.body)
	const newInventory = await Dynamo.write(inventory, tableName).catch(err => {
		console.log('error in dynamo write', err)
		return null
	})

	if (!newInventory) {
		return Response._400({message: 'Failed to write inventory'})
	}

	return Response._200({newInventory})
}