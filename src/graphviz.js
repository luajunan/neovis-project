let neoViz;
let driver;

function draw() {
    console.log("Drawing visualization...");

    const config = {
        containerId: "viz",
        neo4j: {
            serverUrl: "bolt://localhost:7687",
            serverUser: "test1234",
            serverPassword: "test1234",
        },
        visConfig: {
            nodes: {
                shape: 'square'
            },
            edges: {
                // length: 100,
                arrows: {
                    to: { enabled: true }
                }
            },
 
        },
        physics: {
            forceAtlas2Based: {
            gravitationalConstant: -138,
            centralGravity: 0.02,
            springLength: 100
            },
            minVelocity: 0.75,
            solver: "forceAtlas2Based",
        },
        labels: {
            User: {
                label: "name",
                community: "white",
                caption: true,

                [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                    cypher: {

                        value: "MATCH (n) WHERE id(n) = $id RETURN n.size"

                    },

                    function: {

                        title: NeoVis.objectToTitleHtml,

                        title: (props) => NeoVis.objectToTitleHtml(props, ["name"])

                    },


                    static: {
                        shape: "icon",

                        icon: {

                            face: "'Font Awesome 5 Free'",

                            weight: "900", // Font Awesome 5 doesn't work properly unless bold.

                            code: "\uf21b",

                            size: 75,

                            color: "#ea0661",

                        },
                    }
                }

            },
            vIP: {
                label: "name",
                caption: true,

                [NeoVis.NEOVIS_ADVANCED_CONFIG]: {

                    cypher: {

                        value: "MATCH (n) WHERE id(n) = $id RETURN n.size"

                    },

                    function: {

                        title: NeoVis.objectToTitleHtml,

                        title: (props) => NeoVis.objectToTitleHtml(props, ["name", "conf", "actor"])

                    },

                    static: {

                        shape: "icon",

                        icon: {

                            face: "'Font Awesome 5 Free'",

                            weight: "900", // Font Awesome 5 doesn't work properly unless bold.

                            code: "\uf233",

                            size: 75,

                            color: "#74C0FC",

                        },
                    }
                }
            },
            lIP: {
                label: "name",
                caption: true,

                [NeoVis.NEOVIS_ADVANCED_CONFIG]: {

                    cypher: {

                        value: "MATCH (n) WHERE id(n) = $id RETURN n.size"

                    },

                    function: {

                        title: NeoVis.objectToTitleHtml,

                        title: (props) => NeoVis.objectToTitleHtml(props, ["name"])

                    },

                    static: {

                        shape: "icon",

                        icon: {

                            face: "'Font Awesome 5 Free'",

                            weight: "900", // Font Awesome 5 doesn't work properly unless bold.

                            code: "\uf108",

                            size: 75,

                            color: "#72fdc8",

                        },
                    }
                }
            }
        },
        relationships: {
            CONNECTS: {
                label: "first_seen",
                [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                    function: {
                        title: NeoVis.objectToTitleHtml
                    },
                    static: {
                        color: '#8DCC93'
                    }
                }
            },
            USES: {
                label: "first_seen",
                [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                    function: {
                        title: NeoVis.objectToTitleHtml
                    },
                    static: {
                        color: '#8DCC93'
                    }
                }
            }
        },
        initialCypher: "MATCH (n)-[r:CONNECTS]->(m) MATCH (n)-[v:USES]->(t) RETURN *"
    };

    console.log("Configuration:", config);

    try {
        neoViz = new NeoVis.default(config);
        neoViz.render();

        driver = neo4j.driver(
                config.neo4j.serverUrl,
                neo4j.auth.basic(config.neo4j.serverUser, config.neo4j.serverPassword)
            );
    } catch (error) {
        console.error("Error rendering Neovis.js:", error);
    }
}

function toggleDarkMode() {
    const body = document.body;
    const container = document.querySelector('.container');
    const viz = document.getElementById('viz');
    const h1 = document.querySelector('h1');
    const metadata = document.getElementById('metadata');

    body.classList.toggle('dark-mode');
    container.classList.toggle('dark-mode');
    viz.classList.toggle('dark-mode');
    h1.classList.toggle('dark-mode');
    metadata.classList.toggle('dark-mode');

}

function startGraphGeneration() {
    const spinner = document.getElementById('spinner');
    spinner.style.display = 'block'; // Show spinner

    // Simulate graph generation (replace with actual graph generation logic)
    setTimeout(() => {
        // Hide spinner after graph generation is complete
        spinner.style.display = 'none';
    }, 3000); // Adjust this timeout as needed

    // Add your graph generation code here
    draw();
}



function runCypherQuery(query) {
    const spinner = $("#spinner");
    spinner.show();

    const session = driver.session();

    session.run(query)
        .then(result => {
            const nodeCounts = {};
            console.log(result.records)
            result.records.forEach(record => {
                // console.log(record._fields['0']);
                // const node = record.get('n');
                const labels = record._fields['0'].labels;
                console.log(labels);
                labels.forEach(label => {
                    if (!nodeCounts[label]) {
                        nodeCounts[label] = 0;
                    }
                    nodeCounts[label]++;
                });
            });
            console.log(nodeCounts)
            updateTable(nodeCounts);
            spinner.hide();
            session.close();
        })
        .catch(error => {
            console.error(error);
            spinner.hide();
            session.close();
        });
}

function updateTable(nodeCounts) {
    const tableBody = $("#nodeCountTableBody");
    tableBody.empty();
    for (const [nodeType, count] of Object.entries(nodeCounts)) {
        const row = `<tr><td>${nodeType}</td><td>${count}</td></tr>`;
        tableBody.append(row);
    }
}