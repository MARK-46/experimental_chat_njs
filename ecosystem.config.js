module.exports = {
    apps: [
        {
            name: "experimental",
            script: "./build/index.js",
            env: {
                "ENV": "configs/.env"
            },
            watch: false,
            ignore_watch: ["node_modules", "public", "src", "logs", "views"],
        }
    ]
}