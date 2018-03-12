## Install
To install the project please do the following:

 1. Install latest node.js and npm [node.js](https://nodejs.org/en/download/) if you dont have that installed already

 2. Clone the repository and install the required dependencies by running the following
 ```sh
    git clone https://github.com/Chima1707/root.git
    cd root
    npm install
 ```

 ## Run 
`node index.js path_to_file`


## Test
`npm run test`

## Approach Used

The approach was breaking down the application into a `cli(index.js)` and a `service(lib/index)`. this way, we can decide to use the service in another environment.

The `cli` takes care of reading the input text and displaying the result to the console while the `service` takes care of processing the read input and returning the required results.

The `service` does this by splitting the text data into different lines and reducing over all the lines(checking lines that represent `drivers`or `trips` and processing them respectively) and returns a single agreagated object that represents the required results

