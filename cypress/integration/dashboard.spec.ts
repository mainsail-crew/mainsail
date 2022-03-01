describe('Dashboard', () => {
    it('opens the page correctly', function () {
        cy.visit('/')
        cy.wait(2000)
        cy.contains('Connecting to localhost')
    })
})
