cd javascripts
browserify index.js menuGUI.js gameGUI.js client.js --plugin tinyify > ../www/js/bundle.js
::cd ..
::java -jar closure-compiler.jar -O ADVANCED --language_in="ECMASCRIPT_2017" --language_out="ECMASCRIPT_2017" --js="bundle.js" --js_output_file="./www/js/bundle.js"
::java -jar ../closure-compiler.jar --process_common_js_modules -O ADVANCED --language_in="ECMASCRIPT_2017" --language_out="ECMASCRIPT_2017" --entry_point="index.js" --js_output_file="../www/js/bundle.js" --js="index.js" --js="menuGUI.js" --js="gameGUI.js" --js="client.js"