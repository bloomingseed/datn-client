const BASE_API_URL = 'http://datn.local/api/v1/'; // base uri of api server

function action_url(action) {
  return BASE_API_URL + action;
}

function load_dataset(jQuery, cb) {
    jQuery.ajax({
      type: "GET",
      url: action_url(`dataset`),
    }).done(function (data) {
      globalThis.dataset = data
      if(cb) cb()
    });
}

function downloadBlob(blob, fileName = "download.txt") {
  var blob = new Blob([blob]);
  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveBlob(blob, fileName);
  } else {
    var a = window.document.createElement("a");
    a.href = window.URL.createObjectURL(blob, {
      type: "text/plain",
    });
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

$(function () {
  load_dataset($, function(){
    $("#input-model_name").html(
      globalThis.dataset.models.map(function(model){
        return `<option value="${model.key}">${model.name}, `+
          `${(model.accuracy * 100.0).toFixed(2)}%</option>`
      })
    );
  });

  $("#btn-randomize").on("click", function (e) {
    e.preventDefault();
    var indx = Math.floor(Math.random() * globalThis.dataset.length);
    $.ajax({
      type: "GET",
      url: action_url(`dataset/${indx}`),
    }).done(function (data) {
      $("#input-text").val(data.text);
      $("#randomize-info").empty(); // clear content of #randomize-info
      $("#randomize-info").html(
        `<div class="alert alert-info mb-0">` +
          [
            `<strong>Category</strong>: ${data.category}`,
            `<strong>Source</strong>: ${data.source}`,
            `<strong>Source URL</strong>: ${data.url}`,
            `<strong>Length</strong>: ${data.text.length}`,
          ].join("\n") +
          "</div>"
      );
      console.log(data);
    });
  });

  $("form:first").on("submit", function (e) {
    e.preventDefault();
    var formData = {
      text: $("#input-text").val(),
      model_name: $("#input-model_name").val(),
      export: $("#input-export").is(":checked"),
    };
    $.ajax({
      type: "POST",
      url: action_url("predict/"),
      data: JSON.stringify(formData),
      contentType: "application/json; charset=utf-8",
    }).done(function (data, statusText, request) {
      if (formData.export) {
        var header = request.getResponseHeader("Content-Disposition");
        var fileName = header.substring(header.indexOf("=") + 1);
        downloadBlob(data.toString(), fileName);
        return;
      }

      $("#tab-preprocess").text(data.preprocess);
      $("#tab-tokenization").text(data.tokenization);
      $("#tab-vectorization").text(data.vectorization);
      $("#result-prediction").text(data.prediction);
      $("#div-prediction").removeClass("d-none");
      $("#div-prediction")[0].scrollIntoView();
    });
  });
});
