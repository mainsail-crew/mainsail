const Discord = require('discord.js')
const clientBot = new Discord.Client()
const fs = require('fs')

/**
 * Get all files from events folder and register each event in discover bot with name equal filename
 */
fs.readdir(`${__dirname}/events`, (err, files) => {
    if(err)
        throw err

    files.forEach(file => {
        const eventName = file.replace('.js', '')
        const eventFunction = require(`${__dirname}/events/${file}`)
        
        clientBot.on(eventName, (...args) => eventFunction.run(clientBot, ...args))
    })
})

clientBot.login(this.$store.state.gui.discord.token)
