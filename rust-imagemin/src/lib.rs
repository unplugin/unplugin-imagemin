// extern crate wasm_bindgen;
// use image::GenericImageView;
// use wasm_bindgen::prelude::*;
// use web_sys::Node;
// #[wasm_bindgen]
// extern "C" {
//     pub fn alert(s: &str);
// }

// #[wasm_bindgen]
// pub fn get_image_view(filename: Node) -> Node {
//     let img = image::open(filename).unwrap();
//     let (width, height) = img.dimensions();
//     alert(&format!("图片宽度: {:?} 图片高度: {:?}!", width, height));
// }

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    pub fn alert(s: &str);
}

#[wasm_bindgen]
pub fn digest(str: &str) -> String {
    let digest = md5::compute(str);
    let res = format!("{:x}", digest);
    return res;
}
#[wasm_bindgen]
pub fn get_image_view(filename: &str) {
    // let img = image::open(filename).unwrap();
    // let (width, height) = img.dimensions();
    alert(&format!("图片buffer: {:?}", filename));
}
