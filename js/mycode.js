$(document).ready(() => {

  // järkevintä olisi tietysti joka sivulle oma js-tiedosto.

  if ((document.URL).indexOf("BMI") > -1) {

    /******************************************************************************************************************************
      BMI & waist
    ******************************************************************************************************************************/
    //-----------------------------------    
    const modalDialog = (title, message) => {
      //-----------------------------------
      const myModal = new bootstrap.Modal(document.getElementById('myModal'), {
        backdrop: false
      })
      $(".modal-title").html(title);
      $(".modal-body").html(message);
      myModal.show();
    }

    // POPOVER kaikki sivulta löytyvät saavat toimintakoodin (kysymysmerkki-ikonin klikkaus aktivoi)  
    //-----------------------------------    
    const setPopOver = () => {
      //-----------------------------------    
      var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
      popoverTriggerList.map((popoverTriggerEl) => {
        return new bootstrap.Popover(popoverTriggerEl)
      })
    }


    /******************* 
      BMI
    *******************/

    //-----------------------------------
    const getBMIExplArray = () => {
      //-----------------------------------
      const bmiExpl = (_txt, _min, _max) => {

        return ({ txt: _txt, min: _min, max: _max });
      }

      const lim = [0, 17, 18.5, 25, 30, 35, 40, 100];

      let bmiExpArray = [];
      bmiExpArray.push(bmiExpl(`Severly underweight (BMI < ${lim[1]})`, lim[0], lim[1]));
      bmiExpArray.push(bmiExpl(`Underweight (BMI = ${lim[1]} - < ${lim[2]})`, lim[1], lim[2]));
      bmiExpArray.push(bmiExpl(`Normal weight (BMI = ${lim[2]} - < ${lim[3]})`, lim[2], lim[3]));
      bmiExpArray.push(bmiExpl(`Overweight (BMI = ${lim[3]} - < ${lim[4]})`, lim[3], lim[4]));
      bmiExpArray.push(bmiExpl(`Moderate obese (BMI = ${lim[4]} - < ${lim[5]})`, lim[4], lim[5]));
      bmiExpArray.push(bmiExpl(`Severely obese (BMI = ${lim[5]} - < ${lim[6]})`, lim[5], lim[6]));
      bmiExpArray.push(bmiExpl(`Very severely obese (BMI >= ${lim[6]})`, lim[6], lim[7]));

      return bmiExpArray;
    }

    //-----------------------------------    
    const createBMIExplTable = () => {
      //-----------------------------------
      const bmiExpArray = getBMIExplArray();

      $("#list-groupBMI").html("");

      bmiExpArray.forEach((element, i) => {

        $("#list-groupBMI").append(`<li class='list-group-item' id='bmiExp${i}'>${element.txt}</li>`);
      })
    }

    //----------------------------------
    const setBirthYearAttr = () => {
      //----------------------------------      
      $("#birthYear").attr("min", 1900);
      $("#birthYear").attr("max", new Date().getFullYear());
    }

    //----------------------------------
    const validateInput = () => {
      //----------------------------------

      // 1. tsekataan onko ikä syötetty ja sitten onko se annetuissa rajoissa
      const lim = [20, 60];
      const min = Number($("#birthYear").attr("min"));
      const max = Number($("#birthYear").attr("max"));
      const title = $("#birthYear").attr("title");

      const birthYear = Number($("#birthYear").val());

      if (birthYear < min || birthYear > max) {

        modalDialog("Missing input", "You need to write year between " + min + " and " + max + ".");
        return false;

      } else {

        const age = Number(new Date().getFullYear()) - Number($("#birthYear").val());

        if (age < lim[0] || age >= lim[1]) {

          modalDialog("Note the age", "BMI results are for person aged " + lim[0] + "-" + lim[1]);
          return false;

        } else {

          // tarkatetaan muut kentät, niihin ei ole asetettu muita ehtoja kuin että pitää olla jokin arvo
          const weight = Number($("#weight").val());
          const height = Number($("#height").val());

          if (weight === 0 || height === 0) {

            modalDialog("Missing input", "You need to write all input data");
            return false;
          }
          return true;
        }
      }
    }

    //----------------------------------
    const handleBMI = () => {
      //----------------------------------      
      const getBmi = (height, weight) => {

        return (weight / Math.pow(height / 100, 2.5) * 1.3).toFixed(1);
      }

      const getWeightLimit = (value, factor) => {

        let limit = (factor / 1.3) * Math.pow(value / 100, 2.5);
        return limit.toFixed(1);
      };

      if ($("#formBMI").attr('novalidate') !== 'underfiend') {
        if (!validateInput()) {

          return;
        }
      }

      const weight = Number($('#weight').val());
      const height = Number($('#height').val());

      let BMI = getBmi(height, weight);

      if ($('#normalRange').prop('checked') === true) {

        const factor = [18.5, 24.9];
        const result = [];

        for (let i = 0; i < factor.length; i++) {

          result[i] = getWeightLimit(height, factor[i]);
        }

        $('#result_weight').html(" " + result[0] + " - " + result[1]);
      }

      $('#result_bmi').html(" " + BMI);

      selectRow(BMI);
    };


    //----------------------------------
    const selectRow = (BMI) => {
      //----------------------------------
      if (BMI !== null && BMI !== 0) {

        const bmiExpArray = getBMIExplArray();
        bmiExpArray.forEach((element, i) => {

          if (BMI >= element.min && BMI < element.max) {
            $('#bmiExp' + i).addClass("active");

            return;
          }
        })
      }
    }

    //----------------------------------
    const unSelectRow = () => {
      //----------------------------------
      const bmiExpArray = getBMIExplArray();
      bmiExpArray.forEach((element, i) => {

        if ($('#bmiExp' + i).hasClass("active")) {
          $('#bmiExp' + i).removeClass("active");

        }
      });
    };



    $("#formBMI").focusin((e) => {

      $('#result_weight').html("");
      $('#result_bmi').html("");

      unSelectRow();
    });


    /***************
        validointi
    ****************
       /* Validointi page BMI on otettu seuraavasti pois päältä 
       <form id='formBMI' class="needs-validation" novalidate>
       kun käytetään omaa validointia funktiossa validateinput()
        
       ehto 
       if ($("#formBMI").attr('novalidate') !== 'underfiend') {
      */

    // type='number' eli vain numerot hyväksytään, maxlength-attribuutti ei toimi kuin type='text', 
    // joten joudutaan koodilla rajoittamaan syötön pituutta mutta rajoitus voidaan luke maxlenght-attribuutista 

    $("#birthYear").keydown((e) => {
      // estetäänn desimaalien syöttäminen, eliminoidaan pisteen hyväksyminen  
      if (e.keyCode === 190) {
        e.preventDefault();

      } else {

        const obj = $(e.target);
        const lim = Number(obj.attr('maxlength')) - 1;

        // rajoitetaan luettavien merkkienmäärä attribuutin maxlength arvoon
        // jos merkkien maksimimäärä on saavutettu ja painallus on muu kuin 'backspace' niin se hylätään
        if (obj.val().length > lim) {

          if (e.keyCode !== 8) {
            e.preventDefault();
          }

        }
      }
    })

    // estetäänn desimaalien syöttäminen, eliminoidaan pisteen hyväksyminen 
    $("#weight").keydown((e) => {
      if (e.keyCode === 190) {
        e.preventDefault();
      }
    });
    // estetäänn desimaalien syöttäminen, eliminoidaan pisteen hyväksyminen
    $("#height").keydown((e) => {
      if (e.keyCode === 190) {
        e.preventDefault();
      }
    });
    // estetäänn desimaalien syöttäminen, eliminoidaan pisteen hyväksyminen
    $("#waist").keydown((e) => {
      if (e.keyCode === 190) {
        e.preventDefault();
      }
    });


    $("#formBMI").submit((e) => {

      e.preventDefault();
      handleBMI();
    });


    createBMIExplTable();
    setBirthYearAttr();
    setPopOver();

    /******************* 
      waist
    ********************/

    //-----------------------------------
    const unSelectWaistRow = (element) => {
      //-----------------------------------
      if ($(element).hasClass("active")) {
        $(element).removeClass("active");
      }
    }

    //-----------------------------------
    const handleWaist = () => {
      //-----------------------------------
      const gender = $("input[name=gender]:checked").attr('id');
      const waist = Number($("#waist").val());

      if (waist === 0) {

        modalDialog("Missing input", "You need to write all ainput data");
        return;
      }

      let lim = []

      if (gender === 'male') {

        lim = [90, 100];
      } else {
        lim = [80, 90];

      }

      let ind = 0;

      if (waist < lim[0]) {
        ind = 0;
      } else if (waist >= lim[0] && waist <= lim[1]) {
        ind = 1;
      } else {
        ind = 2;
      }

      $("#waistResults li").each((i, element) => {

        if (i === ind) {

          $(element).addClass("active");

        } else {

          unSelectWaistRow(element);
        }
      });
    };

    $("#formWaist").submit((e) => {

      e.preventDefault();
      handleWaist();
    });

    $("input[name=gender]").click(() => {
      $("#waist").focus();
    });

    $("#waist").focusin((e) => {
      $("#waistResults li").each((i, element) => {

        unSelectWaistRow(element);
      });
    });

    // focus menee ilmankin tätä funktiotakin kohteeseen johtuen labelin for attribuutitista
    $("label[class=form-label]").click((e) => {

      let toFocus = "#" + $(e.target).attr("for");
      $(toFocus).focus();
    });


  } else if ((document.URL).indexOf("Quiz") > -1) {

    console.log('QUIZ PAGE script loaded');
    /******************************************************************************************************************************
      QUIZ
    ******************************************************************************************************************************/

    $(".answer").click((e) => {

      const checkResult = () => {

        /* div elementtien, joiden data-question arvo -1 (lähtötilanne),
           muutetaan 1 (oikein) tai 0 (väärin) vastauksesta riippuen
           eli kun ei enää löydy -1 arvoja niin kaikkiin kysymyksiin on vastattu 
        */
        if ($("div[data-question=-1]").length === 0) {

          // oikeiden vastausten lkm
          $('#rightAnswers').html($("div[data-question=1]").length);

          // kaikki kysymysten lkm
          $('#allQuestions').html($("div[data-question]").length);

          $('#resultBtn').removeClass("invisible");
        }
      }

      const questionBlock = $(e.target).parent().parent().parent();

      let answer = Number($(e.target).val());

      // oliko vastaus oikein/väärin korostetaan valinta
      if (answer === 1) {

        $(e.target).parent().addClass("right");

        // kysymyslohkon data-question attribuutin arvoksi 1 
        questionBlock.attr('data-question', '1');

      } else {

        $(e.target).parent().addClass("wrong");

        let nameAttr = $(e.target).attr("name");
        // korostetaan oikea vastaus
        let rightAnswer = "[name=" + nameAttr + "][value=1]";
        $(rightAnswer).parent().addClass("right");

        $(rightAnswer).prop("checked", true);

        // kysymyslohkon data-question attribuutin arvoksi 0 
        questionBlock.attr('data-question', '0');
      }

      // estetään valitsemasta uudelleen
      let liElements = $(e.target).parent().parent().children();
      $(liElements).each((i, e) => {

        $(e).children().first().prop("disabled", true);
      });

      // näytetään teksti kysymykseen liittyen
      let toShow = "#" + $(e.target).attr("name");
      $(toShow).removeClass("invisible");

      checkResult();
    });

  } else if ((document.URL).indexOf("images") > -1) {

    /******************************************************************************************************************************
      imagesTL
    ******************************************************************************************************************************/

    console.log('IMAGES PAGE script loaded');
    //-----------------------------
    const getImages = () => {
      //-----------------------------
      let image = [];
      image.push(['./images/mersu5.jpg', 'Mercedes-Benz 300 SL']);
      image.push(['./images/mersu1.jpg', 'Mercedes-Benz coupe 1957']);
      image.push(['./images/mersu3.jpg', 'Mercedes-Benz 300 SL 1957']);
      image.push(['./images/mersu4.jpg', 'Mercedes-Benz 300 SL']);
      image.push(['./images/mersu2.jpg', 'Mercedes-Benz AMG GT C']);
      image.push(['./images/mersu6.jpg', 'Mercedes-Benz AMG GT']);
      image.push(['./images/mersu7.jpg', 'Mercedes-Benz AMG GT R']);
      image.push(['./images/mersu8.jpg', 'Mercedes-Benz AMG SLS']);

      return image;
    }

    //--------------------------------------------
    const createCollection = (target, image) => {
      //--------------------------------------------
      let imageElements = '';

      image.forEach((item) => {
        let model = `<figure class='col-md-3 col-sm-6'>
      <a href='${item[0]}' data-lightbox='roadtrip' data-title='${item[1]}'
        data-alt='${item[1]}'>
        <img src='${item[0]}' alt='${item[1]}'/>
      </a>
      <figcaption>${item[1]}</figcaption>
       </figure>`;
        imageElements += model;
      });

      $("#" + target).html(imageElements);
    }

    createCollection('imageSection', getImages());
  }

});