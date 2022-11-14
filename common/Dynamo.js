const AWS = require('aws-sdk')
const documentClient = new AWS.DynamoDB.DocumentClient()
const Dynamo = {
	async get (restaurant_id, inventory_id, TableName) {
		const params = {
			TableName,
			Key: {
				"restaurant_id": String(restaurant_id),
				"inventory_id": String(inventory_id)
			}
		}

		const data = await documentClient
			.get(params)
			.promise()

		if (!data || !data.Item) {
			throw Error(`There was an error fetching the data for ID of ${restaurant_id} from ${TableName}`)
		}

		console.log(data)

		return data.Item
	},

	async write (data, TableName) {
		const params = {
			TableName,
			Item: data
		}

		const res = await documentClient.put(params).promise()

		if (!res) {
			throw Error(`There was an error inserting an inventory item in table ${TableName}`)
		}

		return data
	},

	query: async({tableName, restaurant_id, last_inventory_id, queryKey, queryValue}) => {
		const params = {
			TableName: tableName
		}

		let keyConditionExpression = `restaurant_id = :restaurant_id`
		let expressionAttributeValues = {}

		if (queryKey && queryValue) {
			keyConditionExpression = keyConditionExpression + ` and ${queryKey} = :hkey`
			expressionAttributeValues = {
				':restaurant_id': String(restaurant_id),
				':hkey': queryValue
			}
		} else {
			expressionAttributeValues = {
				':restaurant_id': String(restaurant_id)
			}
		}

		if (last_inventory_id != null) {
			params.ExclusiveStartKey = {
				'restaurant_id': String(restaurant_id),
				'inventory_id': String(last_inventory_id)
			}
		}

		params.KeyConditionExpression = keyConditionExpression
		params.ExpressionAttributeValues = expressionAttributeValues

		let queryResults = []
	    let items
	    do {
	        items =  await documentClient.query(params).promise()
	        items.Items.forEach((item) => queryResults.push(item))
	        params.ExclusiveStartKey  = items.LastEvaluatedKey
	    } while(typeof items.LastEvaluatedKey !== "undefined" && total <= 10)
	    
	    return queryResults.slice(0, 10);
	},

	scan: async({tableName, filterAttributeKey, filterAttributeValue}) => {
		let params = {
			TableName: tableName,
			Limit: 2
		}

		if (filterAttributeKey && filterAttributeValue) {
			params.FilterExpression = `${filterAttributeKey} = :filterAttributeValue`
			params.ExpressionAttributeValues = {
				':filterAttributeValue': filterAttributeValue
			}
		}

		let scanResults = []
	    let items
	    do {
	        items =  await documentClient.scan(params).promise()
	        items.Items.forEach((item) => scanResults.push(item))
	        params.ExclusiveStartKey  = items.LastEvaluatedKey
	    } while(typeof items.LastEvaluatedKey !== "undefined")
	    
	    return scanResults;
	},

	update: async({tableName, restaurant_id, inventory_id, updateKey, updateValue}) => {
		const params = {
			TableName: tableName,
			Key: {
				"restaurant_id": String(restaurant_id),
				"inventory_id": String(inventory_id)
			},
			UpdateExpression: `set ${updateKey} = :updateValue`,
			ExpressionAttributeValues: {
				':updateValue': updateValue
			},
			ReturnValues: 'ALL_NEW'
		}

		return documentClient.update(params).promise()
	}
}

module.exports = Dynamo