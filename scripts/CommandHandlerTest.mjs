export default (robot) => {
	robot.commands.register({
		id: 'tickets.create',
		description: 'Create a ticket',
		examples: [
			'tickets.create --title "Fix login bug" --priority high',
			'tickets.create --title "Update documentation"'
		],
		aliases: ['create ticket', 'new ticket'],
		args: {
			title: { type: 'string', required: true },
			priority: { type: 'enum', values: ['low', 'medium', 'high'], default: 'medium' }
		},
		sideEffects: ['creates external ticket'],
		handler: async (ctx) => {
			return `Created ticket: ${ctx.args.title}`
		}
	})
	robot.commands.register({
		id: 'tickets.list',
		description: 'List all tickets',
		aliases: ['list tickets', 'show tickets'],
		handler: async (ctx) => {
			return 'Listing all tickets...'
		}
	})

	robot.respond(/ticket help/i, async (ctx) => {
		await ctx.reply('To create a ticket, use the command: create ticket <title> [priority]')
	})
}