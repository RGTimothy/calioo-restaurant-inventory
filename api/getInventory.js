const Response = require('../common/Response')
const Dynamo = require('../common/Dynamo')
const tableName = process.env.tableName

exports.handler = async event => {
	console.log('event', event)

	let page
	if (!event.queryStringParameters || !event.queryStringParameters.page) {
		page = 0
	} else {
		page = event.queryStringParameters.page
	}

	let restaurant_id
	if (!event.queryStringParameters || !event.queryStringParameters.restaurant_id) {
		restaurant_id = null
	} else {
		restaurant_id = event.queryStringParameters.restaurant_id
	}

	let last_inventory_id
	if (!event.queryStringParameters || !event.queryStringParameters.last_inventory_id) {
		last_inventory_id = null
	} else {
		last_inventory_id = event.queryStringParameters.last_inventory_id
	}	

	if (!event.pathParameters || !event.pathParameters.id) {
		if (restaurant_id != null) {
			// using query
			inventory = await Dynamo.query({
				tableName,
				restaurant_id: restaurant_id,
				last_inventory_id: last_inventory_id
			})	
		} else {
			// using scan
			inventory = await Dynamo.scan({
				tableName
			})
		}

	} else {
		let inventory_id = event.pathParameters.id

		/*inventory = await Dynamo.scan({
			tableName,
			filterAttributeKey: 'inventory_id',
			filterAttributeValue: inventory_id
		})*/

		inventory = await Dynamo.query({
			tableName,
			restaurant_id: restaurant_id,
			last_inventory_id: last_inventory_id,
			queryKey: 'inventory_id',
			queryValue: inventory_id
		})
	}

	if (!inventory) {
		return Response._400({message: 'Failed to get inventory'})
	}

	return Response._200({inventory})
}