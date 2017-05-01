module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		
        lambda_invoke: {
            clientToken: {
                options: {
                    handler: 'clientToken',
                    file_name: 'lambdas.js',
                    event: 'clientToken-event.json'
                }
            },
            donate: {
                options: {
                    handler: 'donate',
                    file_name: 'lambdas.js',
                    event: 'donate-event.json'
                }
            }
        },
		lambda_package: {
        	default: {
            	options: {
                    include_time: false,
                    include_version: false
            	}
        	}
        },
        lambda_deploy: {
        	clientToken: {
            	arn: 'arn:aws:lambda:us-east-1:669821887388:function:DonationApp_clientToken',
                package: './dist/server_latest.zip',
        	},
            donate: {
                arn: 'arn:aws:lambda:us-east-1:669821887388:function:donationApp_donate',
                package: './dist/server_latest.zip'
            }
        }
	});

	grunt.loadNpmTasks('grunt-aws-lambda');


};