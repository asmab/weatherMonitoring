<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
header("Content-Type: application/json,text/plain, */* ; charset=UTF-8"); 

 	require_once("Rest.inc.php");
	
	class API extends REST {
	
		public $data = "";
		
		const DB_SERVER = "127.0.0.1";
		const DB_USER = "root";
		const DB_PASSWORD = "";
		const DB = "weatherdb";

		private $db = NULL;
		private $mysqli = NULL;
		public function __construct(){
			parent::__construct();				// Init parent contructor
			$this->dbConnect();					// Initiate Database connection
		}
		
		/*
		 *  Connect to Database
		*/
		private function dbConnect(){
			$this->mysqli = new mysqli(self::DB_SERVER, self::DB_USER, self::DB_PASSWORD, self::DB);
		}
		
		/*
		 * Dynmically call the method based on the query string
		 */
		public function processApi(){
			$func = strtolower(trim(str_replace("/","",$_REQUEST['x'])));
			if((int)method_exists($this,$func) > 0)
				$this->$func();
			else
				$this->response('',404); // If the method not exist with in this class "Page not found".
		}
				
		
		private function cities(){	
			if($this->get_request_method() != "GET"){
				$this->response('',406);
			}
			$query="SELECT name, cep, created FROM city ";
			$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);

			if($r->num_rows > 0){
				$result = array();
				while($row = $r->fetch_assoc()){
					$result[] = $row;
				}
				$this->response($this->json($result), 200); // send user details
			}
			$this->response('',204);	// If no records "No Content" status
		}
		private function city(){	
			if($this->get_request_method() != "GET"){
				$this->response('',406);
			}
			$name = $this->_request['name'];
			if($name != '' ){	
				$query="SELECT c.name, c.cep, c.created FROM city c where c.name=$name";
				$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
				if($r->num_rows > 0) {
					$result = $r->fetch_assoc();	
					$this->response($this->json($result), 200); // send user details
				}
			}
			$this->response('',204);	// If no records "No Content" status
		}
		
		private function insertCity(){
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}

		
			$city = json_decode(file_get_contents("php://input"),true);
			$column_names = array('name', 'cep');
			$keys = array_keys($city);
			$columns = '';
			$values = '';
			foreach($column_names as $desired_key){ // Check the city received. If blank insert blank into the array.
			   if(!in_array($desired_key, $keys)) {
			   		$$desired_key = '';
				}else{
					$$desired_key = $city[$desired_key];
				}
				$columns = $columns.$desired_key.',';
				$values = $values."'".$$desired_key."',";
			}
			$query = "INSERT INTO city(".trim($columns,',').") VALUES(".trim($values,',').")";
			if(!empty($city)){
				$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
				$success = array('status' => "Success", "msg" => "city Created Successfully.", "data" => $city);
				$this->response($this->json($success),200);
			}else
				$this->response('',204);	//"No Content" status
		}
		
	
		private function deleteCity(){
		
			$name =$this->_request['name'];
			$success = array('status' => "Success", "msg" => "Successfully deleted one record.");
			$error = array('status' => "Error", "msg" => "Unkown error while deleting city.");
			
		
				$query="DELETE FROM city WHERE name = '".$name."';";
				$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
				
				$this->response($this->json($success),200);
			
		}
		
		
		
			private function insertWeather(){
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}
        
			
			$weather = json_decode(file_get_contents("php://input"),true);
			$column_names = array('temp_act', 'temp_min', 'temp_max','city');
			$keys = array_keys($weather);
			$columns = '';
			$values = '';
			foreach($column_names as $desired_key){ // Check the city received. If blank insert blank into the array.
			   if(!in_array($desired_key, $keys)) {
			   		$$desired_key = '';
				}else{
					$$desired_key = $weather[$desired_key];
				}
				$columns = $columns.$desired_key.',';
				$values = $values."'".$$desired_key."',";
			}
				
			//$city_name =$this->_request['city'];
            //$values[5]  = $city_name;
				
				
			$query = "INSERT INTO weather (".trim($columns,',').") VALUES(".trim($values,',').")";
			if(!empty($weather)){
				
				$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
				$success = array('status' => "Success", "msg" => "weather inserted Successfully.", "data" => $weather);
				$this->response($this->json($success),200);
			}else
				$this->response('',204);	//"No Content" status
		}
		
		
		
		
		/*
		 *	Encode array into JSON
		*/
		private function json($data){
			if(is_array($data)){
				return json_encode($data);
			}
		}
	}
	
	// Initiiate Library
	
	$api = new API;
	$api->processApi();
?>